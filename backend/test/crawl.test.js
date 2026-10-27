import test from 'node:test';
import assert from 'node:assert/strict';
import { crawlWebsite, normalizeCrawlUrl, validateCrawlOptions } from '../src/services/crawlWebsite.js';

const browser = {};
const validate = async url => url;

test('normalizes fragments and tracking query parameters', () => {
  assert.equal(normalizeCrawlUrl('https://example.com/a?utm_source=x&b=2&a=1#top'), 'https://example.com/a?a=1&b=2');
});

test('rejects crawl settings outside resource limits', () => {
  assert.throws(() => validateCrawlOptions({ maxPages: 21, maxDepth: 1, sameOrigin: true }));
  assert.throws(() => validateCrawlOptions({ maxPages: 2, maxDepth: 4, sameOrigin: true }));
  assert.throws(() => validateCrawlOptions({ maxPages: 2, maxDepth: 1, sameOrigin: 'false' }));
});

test('crawls permitted links once and reports failures and skips', async () => {
  const visited = [];
  const updates = [];
  const result = await crawlWebsite('https://example.com/', { maxPages: 5, maxDepth: 2, sameOrigin: true }, progress => updates.push(progress), {
    browser, validate,
    scanPage: async url => {
      visited.push(url);
      if (url.endsWith('/broken')) throw new Error('The website returned HTTP 404.');
      return { url, issues: [{ id: 'image-alt', count: 1 }], screenshot: 'image', summary: { total: 1 },
        links: url.endsWith('/a') ? ['https://example.com/', 'https://example.com/deep']
          : url.endsWith('/deep') ? ['https://example.com/too-deep']
            : ['https://example.com/a#top', 'https://example.com/a', 'https://example.com/broken', 'https://other.example/page', 'https://example.com/logout'] };
    },
  });
  assert.deepEqual(visited, ['https://example.com/', 'https://example.com/a', 'https://example.com/broken', 'https://example.com/deep']);
  assert.equal(result.summary.completedPages, 3);
  assert.equal(result.summary.failedPages, 1);
  assert.equal(result.summary.skippedPages, 2);
  assert.equal(result.issues.length, 3);
  assert.equal(new Set(result.issues.map(issue => issue.id)).size, 3);
  assert.equal(updates.at(-1).completedPages, 3);
  assert.equal(result.pages.find(page => page.status === 'failed').error, 'The website returned HTTP 404.');
});

test('stops at the page cap and closes an owned browser', async () => {
  let closed = false;
  const result = await crawlWebsite('https://example.com/', { maxPages: 1, maxDepth: 2, sameOrigin: false }, undefined, {
    validate, launch: async () => ({ close: async () => { closed = true; } }),
    scanPage: async url => ({ url, issues: [], summary: { total: 0 }, links: ['https://other.example/page'] }),
  });
  assert.equal(result.summary.completedPages, 1);
  assert.equal(result.summary.skippedPages, 1);
  assert.equal(closed, true);
});

test('skips unsafe discovered destinations before scanning them', async () => {
  const visited = [];
  const result = await crawlWebsite('https://example.com/', { maxPages: 3, maxDepth: 1, sameOrigin: false }, undefined, {
    browser,
    validate: async url => {
      if (url.includes('127.0.0.1')) throw new Error('Private address');
      return url;
    },
    scanPage: async url => {
      visited.push(url);
      return { url, issues: [], summary: { total: 0 }, links: ['http://127.0.0.1/admin'] };
    },
  });
  assert.deepEqual(visited, ['https://example.com/']);
  assert.equal(result.summary.skippedPages, 1);
  assert.equal(result.summary.failedPages, 0);
  assert.equal(result.pages.find(page => page.status === 'skipped').reason, 'Unsafe or unavailable URL');
});

test('closes the browser after a page fails', async () => {
  let closed = false;
  const result = await crawlWebsite('https://example.com/', { maxPages: 1, maxDepth: 0, sameOrigin: true }, undefined, {
    validate, launch: async () => ({ close: async () => { closed = true; } }),
    scanPage: async () => { throw new Error('The website returned HTTP 403.'); },
  });
  assert.equal(result.summary.failedPages, 1);
  assert.equal(closed, true);
});
