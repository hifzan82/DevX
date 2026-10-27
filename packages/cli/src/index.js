import axe from 'axe-core';
import puppeteer from 'puppeteer';

export async function scanUrl(url) {
  let target;
  try { target = new URL(url); } catch { throw new Error('Enter a valid HTTP or HTTPS URL.'); }
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) {
    throw new Error('Enter an HTTP or HTTPS URL without credentials.');
  }
  const browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--no-sandbox'] });
  let page;
  try {
    page = await browser.newPage();
    page.setDefaultTimeout(20000);
    const response = await page.goto(target.toString(), { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!response || response.status() >= 400) throw new Error(`Website returned HTTP ${response?.status() || 'no response'}.`);
    if (!['http:', 'https:'].includes(new URL(page.url()).protocol)) throw new Error('The website redirected to an unsupported URL.');
    await page.evaluate(axe.source);
    const results = await page.evaluate(async () => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    }));
    const issues = (results.violations || []).map(v => ({ rule: v.id, severity: v.impact || 'moderate', count: v.nodes?.length || 0, help: v.help }));
    return { url: page.url(), issues, summary: { rules: issues.length, total: issues.reduce((s,i)=>s+i.count,0) } };
  } finally {
    await page?.close().catch(()=>{});
    await browser.close().catch(()=>{});
  }
}
