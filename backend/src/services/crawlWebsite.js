import puppeteer from 'puppeteer';
import { assertPublicUrl, parsePublicUrl } from './publicUrl.js';
import { scanWebsite } from './scanWebsite.js';

export const CRAWL_LIMITS = { maxPages: 20, maxDepth: 3 };
const EXCLUDED_PATH = /(?:^|\/)(?:logout|log-out|signout|sign-out|delete|remove|unsubscribe)(?:\/|$)/i;

export function normalizeCrawlUrl(value) {
  const url = parsePublicUrl(value);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.toString();
}

export function validateCrawlOptions(input) {
  if (!input || !Number.isInteger(input.maxPages) || input.maxPages < 1 || input.maxPages > CRAWL_LIMITS.maxPages) {
    throw new Error(`Maximum pages must be between 1 and ${CRAWL_LIMITS.maxPages}.`);
  }
  if (!Number.isInteger(input.maxDepth) || input.maxDepth < 0 || input.maxDepth > CRAWL_LIMITS.maxDepth) {
    throw new Error(`Maximum depth must be between 0 and ${CRAWL_LIMITS.maxDepth}.`);
  }
  if (typeof input.sameOrigin !== 'boolean') throw new Error('Same-origin restriction must be true or false.');
  return { maxPages: input.maxPages, maxDepth: input.maxDepth, sameOrigin: input.sameOrigin };
}

export async function crawlWebsite(startUrl, config, onProgress = async () => {}, options = {}) {
  const { maxPages, maxDepth, sameOrigin } = validateCrawlOptions(config);
  const validate = options.validate || assertPublicUrl;
  const start = normalizeCrawlUrl(await validate(startUrl));
  const origin = new URL(start).origin;
  const browser = options.browser || await (options.launch || puppeteer.launch)({
    headless: true, args: ['--disable-dev-shm-usage', '--no-sandbox'], protocolTimeout: 30000,
  });
  const scanPage = options.scanPage || scanWebsite;
  const pending = [{ url: start, depth: 0 }];
  const deadline = Date.now() + 4.5 * 60_000;
  const seen = new Set([start]);
  const pages = [];
  let completedPages = 0;
  let failedPages = 0;
  let skippedPages = 0;
  const report = () => onProgress({ completedPages, failedPages, skippedPages, queuedPages: pending.length, totalPages: completedPages + failedPages + pending.length });
  const skip = (url, depth, reason) => {
    skippedPages += 1;
    if (pages.filter(page => page.status === 'skipped').length < 50) pages.push({ url, depth, status: 'skipped', reason });
  };
  try {
    await report();
    while (pending.length && completedPages + failedPages < maxPages && Date.now() < deadline) {
      const current = pending.shift();
      try { await validate(current.url); }
      catch { skip(current.url, current.depth, 'Unsafe or unavailable URL'); await report(); continue; }
      try {
        const result = await scanPage(current.url, () => {}, {
          browser, discoverLinks: true, allowedOrigin: sameOrigin ? origin : undefined,
        });
        const finalUrl = normalizeCrawlUrl(result.url);
        if (sameOrigin && new URL(finalUrl).origin !== origin) throw new Error('The page redirected outside the permitted origin.');
        completedPages += 1;
        pages.push({ url: finalUrl, depth: current.depth, status: 'completed', issues: result.issues, screenshot: result.screenshot, summary: result.summary });
        seen.add(finalUrl);
        if (current.depth < maxDepth) {
          for (const raw of (result.links || []).slice(0, 200)) {
            let link;
            try { link = normalizeCrawlUrl(new URL(raw, finalUrl).toString()); } catch { skip(String(raw).slice(0, 2048), current.depth + 1, 'Unsupported URL'); continue; }
            if (seen.has(link)) continue;
            seen.add(link);
            const parsed = new URL(link);
            if (sameOrigin && parsed.origin !== origin) { skip(link, current.depth + 1, 'Outside starting origin'); continue; }
            if (EXCLUDED_PATH.test(parsed.pathname)) { skip(link, current.depth + 1, 'Excluded action URL'); continue; }
            if (pending.length >= 100) { skip(link, current.depth + 1, 'Discovery limit reached'); continue; }
            pending.push({ url: link, depth: current.depth + 1 });
          }
        }
      } catch (error) {
        failedPages += 1;
        pages.push({ url: current.url, depth: current.depth, status: 'failed', error: error.message?.startsWith('The website') || error.message?.startsWith('The page') ? error.message : 'This page could not be scanned.' });
      }
      await report();
    }
    for (const item of pending) skip(item.url, item.depth, Date.now() >= deadline ? 'Crawl time limit reached' : 'Maximum pages reached');
    pending.length = 0;
    await report();
    const completed = pages.filter(page => page.status === 'completed');
    const issues = completed.flatMap((page, pageIndex) => page.issues.map(issue => ({ ...issue, id: `${pageIndex}-${issue.id}`, pageUrl: page.url })));
    return { url: start, pages, issues, summary: {
      completedPages, failedPages, skippedPages,
      total: issues.reduce((sum, issue) => sum + issue.count, 0), rules: issues.length,
    }, scannedAt: new Date().toISOString() };
  } finally {
    if (!options.browser) await browser.close().catch(() => {});
  }
}
