import puppeteer from "puppeteer";
import axe from "axe-core";

const MAX_TEXT = 12000;
const MAX_ACTIVE = 2;
let active = 0;

const AXE_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload) {
  const html = text(payload?.html);
  const fix = text(payload?.fix);
  const rule = text(payload?.issue?.rule);

  if (!html || !fix || !rule) {
    return {
      reason:
        "An original element, proposed HTML replacement, and target rule are required.",
    };
  }

  if (html.length > MAX_TEXT || fix.length > MAX_TEXT || rule.length > 120) {
    return {
      reason: "The supplied element or fix exceeds verification limits.",
    };
  }

  const language = text(
    payload?.type || payload?.issue?.fixType || "html",
  ).toLowerCase();

  if (language !== "html") {
    return {
      reason:
        "Only single-element HTML replacements support automated verification. CSS, JavaScript, and React require manual review.",
    };
  }

  if (
    /<(?:script|style|iframe|object|embed|svg|math|link|meta|base|template|video|audio)\b/i.test(
      html + fix,
    )
  ) {
    return {
      reason: "Executable, embedded, and complex markup is not supported.",
    };
  }

  return { html, fix, rule };
}

function manual(reason, extra = {}) {
  return {
    status: "Needs Manual Review",
    targetedResolved: false,
    newViolations: [],
    resolvedViolations: [],
    remainingViolations: [],
    message: reason,
    temporary: true,
    scope: "isolated-element",
    ...extra,
  };
}

async function prepare(page, html, fix) {
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    void request.abort().catch(() => {});
  });

  await page.setContent(
    '<!doctype html><html lang="en"><head><title>Isolated accessibility check</title></head><body><main id="accesslens-root"></main></body></html>',
    { waitUntil: "load", timeout: 10000 },
  );

  return page.evaluate(
    ({ original, replacement }) => {
      const allowed = new Set(
        "a abbr article aside b blockquote br button caption code dd del details div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr i img input label legend li main nav ol option p picture pre section select small span strong summary table tbody td textarea th thead tr u ul".split(
          " ",
        ),
      );

      const attrs = new Set(
        "alt aria-label aria-labelledby aria-describedby aria-hidden aria-expanded aria-controls aria-required aria-invalid aria-current autocomplete checked class disabled for href id lang max maxlength min minlength multiple name placeholder readonly required role scope selected src tabindex title type value width height".split(
          " ",
        ),
      );

      function parse(source) {
        const doc = new DOMParser().parseFromString(
          `<body>${source}</body>`,
          "text/html",
        );

        if (
          doc.querySelector(
            "parsererror,script,style,iframe,object,embed,svg,math,link,meta,base,template,video,audio",
          )
        ) {
          return null;
        }

        const roots = [...doc.body.childNodes].filter(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE ||
            (node.nodeType === Node.TEXT_NODE && node.textContent.trim()),
        );

        if (roots.length !== 1 || roots[0].nodeType !== Node.ELEMENT_NODE) {
          return null;
        }

        const root = roots[0];
        const elements = [root, ...root.querySelectorAll("*")];

        if (elements.length > 100) return null;

        for (const element of elements) {
          if (!allowed.has(element.localName)) return null;

          for (const attribute of [...element.attributes]) {
            const name = attribute.name.toLowerCase();

            if (
              !attrs.has(name) &&
              !/^aria-[a-z-]+$/.test(name) &&
              !/^data-[a-z-]+$/.test(name)
            ) {
              return null;
            }

            if (name === "href" && !/^#[\w-]+$/.test(attribute.value)) {
              element.removeAttribute(name);
            }

            if (name === "src") {
              element.setAttribute(
                "src",
                "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
              );
            }

            if (name === "id" && attribute.value.length > 150) {
              return null;
            }
          }
        }

        return root;
      }

      const before = parse(original);
      const after = parse(replacement);

      if (!before || !after) {
        return {
          reason:
            "Only one safe HTML element and its children may be replaced. Multi-element patches require manual review.",
        };
      }

      if (before.localName !== after.localName) {
        return {
          reason: "Changing the root element type requires manual review.",
        };
      }

      return {
        original: before.outerHTML,
        proposed: after.outerHTML,
      };
    },
    { original: html, replacement: fix },
  );
}

async function audit(page, markup) {
  await page.evaluate((html) => {
    const root = document.getElementById("accesslens-root");
    root.replaceChildren();
    root.innerHTML = html;
  }, markup);

  await page.evaluate(axe.source);

  return page.evaluate(async (tags) => {
    const results = await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: tags,
      },
    });

    return results.violations.map((violation) => ({
      rule: violation.id,
      count: violation.nodes.length,
      selectors: violation.nodes.map((node) => node.target.join(" ")),
    }));
  }, AXE_TAGS);
}

export async function previewFix(payload = {}) {
  const validated = validatePayload(payload);

  if (validated.reason) {
    return manual(validated.reason);
  }

  return {
    status: "Unverified",
    beforeHtml: validated.html,
    afterHtml: validated.fix,
    message:
      "Proposed HTML replacement. Use Verify to run axe-core in an isolated environment.",
    temporary: true,
    scope: "isolated-element",
  };
}

export async function verifyFixDetailed(payload = {}, options = {}) {
  const validated = validatePayload(payload);

  if (validated.reason) {
    return manual(validated.reason);
  }

  if (active >= MAX_ACTIVE) {
    return manual("Verification capacity is busy. Try again shortly.");
  }

  active += 1;

  let browser;
  let page;

  try {
    const launch = options.launch || puppeteer.launch;

    browser = await launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
      protocolTimeout: 30000,
    });

    page = await browser.newPage();
    page.setDefaultTimeout(12000);

    await page.setJavaScriptEnabled(false);

    const parsed = await prepare(page, validated.html, validated.fix);

    if (parsed.reason) {
      return manual(parsed.reason);
    }

    await page.setJavaScriptEnabled(true);

    const before = await audit(page, parsed.original);
    const after = await audit(page, parsed.proposed);

    const baseline = new Map(
      before.map((violation) => [violation.rule, violation.count]),
    );

    const updated = new Map(
      after.map((violation) => [violation.rule, violation.count]),
    );

    const targetBefore = baseline.get(validated.rule) || 0;
    const targetAfter = updated.get(validated.rule) || 0;

    const introduced = after
      .filter(
        (violation) => (baseline.get(violation.rule) || 0) < violation.count,
      )
      .map((violation) => ({
        rule: violation.rule,
        before: baseline.get(violation.rule) || 0,
        after: violation.count,
      }));

    const resolved = before
      .filter(
        (violation) => (updated.get(violation.rule) || 0) < violation.count,
      )
      .map((violation) => ({
        rule: violation.rule,
        before: violation.count,
        after: updated.get(violation.rule) || 0,
      }));

    const targetedResolved = targetBefore > 0 && targetAfter === 0;

    const status =
      targetedResolved && introduced.length === 0
        ? "Verified"
        : targetBefore === 0
          ? "Needs Manual Review"
          : targetAfter > 0
            ? "Failed"
            : "Needs Manual Review";

    const message =
      targetBefore === 0
        ? "The target rule was not reproducible in isolation. The fix cannot be confirmed."
        : status === "Verified"
          ? "The targeted rule was resolved in the isolated element test without new automated violations. The live website remains unverified."
          : targetAfter > 0
            ? "The targeted violation remains after applying the replacement."
            : "The targeted violation disappeared, but new violations were introduced. Manual review is required.";

    return {
      status,
      targetedResolved,
      newViolations: introduced,
      resolvedViolations: resolved,
      remainingViolations: after,
      baselineViolations: before,
      temporary: true,
      scope: "isolated-element",
      message,
    };
  } catch (error) {
    return manual(`Isolated verification could not complete: ${error.message}`);
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }

    if (browser) {
      await browser.close().catch(() => {});
    }

    active -= 1;
  }
}
