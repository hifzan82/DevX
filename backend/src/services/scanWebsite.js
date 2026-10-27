import axe from "axe-core";
import puppeteer from "puppeteer";
import { assertPublicUrl } from "./publicUrl.js";
import { normalizeResults } from "./normalizeResults.js";

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 375, height: 812 },
};

const MAX_CAPTURE_HEIGHT = 5000;
const MAX_ELEMENTS_PER_ISSUE = 25;

function selectorsForIssue(issue, violations) {
  const matched = violations.find((violation) => violation.id === issue.rule);

  const selectors = [
    issue.selector,
    ...(Array.isArray(issue.selectors) ? issue.selectors : []),
    ...(matched?.nodes || []).flatMap((node) =>
      Array.isArray(node.target) ? node.target : [],
    ),
  ];

  return [
    ...new Set(selectors.filter((item) => typeof item === "string")),
  ].slice(0, MAX_ELEMENTS_PER_ISSUE);
}

async function getBoundsForIssues(page, issues, violations, captureHeight) {
  const selectors = issues.map((issue) => selectorsForIssue(issue, violations));

  return page.evaluate(
    ({ groups, maxHeight, maxElements }) =>
      groups.map((group) => {
        const bounds = [];
        const seen = new Set();

        for (const selector of group) {
          let elements;

          try {
            elements = document.querySelectorAll(selector);
          } catch {
            continue;
          }

          for (const element of elements) {
            if (seen.has(element)) continue;

            seen.add(element);

            const rect = element.getBoundingClientRect();

            const x = rect.left + window.scrollX;
            const y = rect.top + window.scrollY;

            if (
              !Number.isFinite(x) ||
              !Number.isFinite(y) ||
              rect.width <= 0 ||
              rect.height <= 0 ||
              y >= maxHeight ||
              y + rect.height <= 0
            ) {
              continue;
            }

            bounds.push({
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: Math.min(rect.width, window.innerWidth - Math.max(0, x)),
              height: Math.min(rect.height, maxHeight - Math.max(0, y)),
            });

            if (bounds.length >= maxElements) break;
          }

          if (bounds.length >= maxElements) break;
        }

        return bounds.filter((rect) => rect.width > 0 && rect.height > 0);
      }),
    {
      groups: selectors,
      maxHeight: captureHeight,
      maxElements: MAX_ELEMENTS_PER_ISSUE,
    },
  );
}

async function captureViewport(page, viewport, issues, violations) {
  const { width, height } = VIEWPORTS[viewport];

  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
    isMobile: viewport === "mobile",
    hasTouch: viewport === "mobile",
  });

  await page.evaluate(() => window.scrollTo(0, 0));

  await new Promise((resolve) => setTimeout(resolve, 400));

  const documentHeight = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;

    return Math.max(
      window.innerHeight,
      doc?.scrollHeight || 0,
      body?.scrollHeight || 0,
    );
  });

  const captureHeight = Math.min(
    MAX_CAPTURE_HEIGHT,
    Math.max(height, documentHeight),
  );

  const bounds = await getBoundsForIssues(
    page,
    issues,
    violations,
    captureHeight,
  );

  const screenshot = await page.screenshot({
    type: "jpeg",
    quality: 65,
    encoding: "base64",
    clip: {
      x: 0,
      y: 0,
      width,
      height: captureHeight,
    },
    captureBeyondViewport: true,
  });

  return {
    screenshot: `data:image/jpeg;base64,${screenshot}`,
    bounds,
    width,
    height: captureHeight,
  };
}

export async function scanWebsite(url, onStage = async () => {}, options = {}) {
  const validate = options.validate || assertPublicUrl;
  const launch = options.launch || puppeteer.launch;

  const target = await validate(url);

  let browser;
  let page;

  try {
    await onStage("launching", 10);

    browser =
      options.browser ||
      (await launch({
        headless: true,
        args: ["--disable-dev-shm-usage", "--no-sandbox"],
        protocolTimeout: 30000,
      }));

    page = await browser.newPage();

    page.setDefaultTimeout(20000);
    await page.setBypassServiceWorker(true);

    await page.evaluateOnNewDocument(() => {
      window.WebSocket = class {
        constructor() {
          throw new Error("WebSocket unavailable during audit");
        }
      };
    });

    await page.setRequestInterception(true);

    let requestCount = 0;

    page.on("request", (request) => {
      requestCount += 1;

      if (requestCount > 150) {
        void request.abort().catch(() => {});
        return;
      }

      const requestUrl = request.url();

      if (!/^https?:/i.test(requestUrl)) {
        void request.abort().catch(() => {});
        return;
      }

      void validate(requestUrl)
        .then(() => {
          if (
            options.allowedOrigin &&
            request.isNavigationRequest() &&
            request.frame() === page.mainFrame() &&
            new URL(requestUrl).origin !== options.allowedOrigin
          ) {
            return request.abort();
          }

          return request.continue();
        })
        .catch(() => request.abort())
        .catch(() => {});
    });

    await onStage("loading", 25);

    const response = await page.goto(target, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    if (!response) {
      throw new Error("The website did not return a page.");
    }

    if (response.status() >= 400) {
      if (response.headers()["cf-mitigated"] === "challenge") {
        throw new Error(
          "The website requires a browser challenge and cannot be scanned automatically.",
        );
      }

      throw new Error(`The website returned HTTP ${response.status()}.`);
    }

    const finalUrl = await validate(page.url());

    if (
      options.allowedOrigin &&
      new URL(finalUrl).origin !== options.allowedOrigin
    ) {
      throw new Error("The page redirected outside the permitted origin.");
    }

    await onStage("analyzing", 55);

    await page.evaluate(axe.source);

    let scanTimer;

    const timeout = new Promise((_, reject) => {
      scanTimer = setTimeout(() => reject(new Error("Scan timeout")), 45000);
    });

    let results;

    try {
      results = await Promise.race([
        page.evaluate(async () =>
          window.axe.run(document, {
            runOnly: {
              type: "tag",
              values: [
                "wcag2a",
                "wcag2aa",
                "wcag21a",
                "wcag21aa",
                "wcag22aa",
                "best-practice",
              ],
            },
          }),
        ),
        timeout,
      ]);
    } finally {
      clearTimeout(scanTimer);
    }

    const issues = normalizeResults(results.violations, finalUrl);

    await onStage("capturing-desktop-preview", 75);

    const desktop = await captureViewport(
      page,
      "desktop",
      issues,
      results.violations,
    );

    await onStage("capturing-mobile-preview", 90);

    const mobile = await captureViewport(
      page,
      "mobile",
      issues,
      results.violations,
    );

    issues.forEach((issue, index) => {
      issue.previewBounds = {
        desktop: desktop.bounds[index],
        mobile: mobile.bounds[index],
      };

      issue.bounds = desktop.bounds[index]?.[0] || null;
      issue.boundsDesktop = desktop.bounds[index];
      issue.boundsMobile = mobile.bounds[index];
    });

    const links = options.discoverLinks
      ? await page.evaluate(() =>
          Array.from(
            document.querySelectorAll("a[href]"),
            (link) => link.href,
          ).slice(0, 200),
        )
      : [];

    await onStage("completed", 100);

    return {
      url: finalUrl,
      issues,
      screenshot: desktop.screenshot,
      screenshotMobile: mobile.screenshot,
      screenshots: {
        desktop: desktop.screenshot,
        mobile: mobile.screenshot,
      },
      previewDimensions: {
        desktop: {
          width: desktop.width,
          height: desktop.height,
        },
        mobile: {
          width: mobile.width,
          height: mobile.height,
        },
      },
      links,
      summary: {
        total: issues.reduce(
          (total, issue) => total + (Number(issue.count) || 0),
          0,
        ),
        rules: issues.length,
      },
      scannedAt: new Date().toISOString(),
      axeVersion: results.testEngine.version,
    };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }

    if (browser && !options.browser) {
      await browser.close().catch(() => {});
    }
  }
}
