import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicUrl, isPublicAddress } from '../src/services/publicUrl.js';
import { normalizeResults } from '../src/services/normalizeResults.js';
import { scanWebsite } from '../src/services/scanWebsite.js';

test('rejects private, malformed, and unsupported URLs', async () => {
  for (const url of ['http://127.0.0.1', 'http://[::1]', 'http://169.254.169.254', 'http://10.0.0.2', 'file:///etc/passwd', 'http://user:pass@example.com', 'https://example.com:8443', 'http://localhost', 'http://example.com']) {
    await assert.rejects(assertPublicUrl(url, async () => [{ address: '192.168.1.1' }]));
  }
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('::ffff:127.0.0.1'), false);
  assert.equal(await assertPublicUrl('https://example.com/a#fragment', async () => [{ address: '8.8.8.8' }]), 'https://example.com/a');
});

test('maps axe rule and node evidence without inventing a code patch', () => {
  const [issue] = normalizeResults([{ id: 'image-alt', help: 'Images must have alternate text', description: 'Ensures images have alternate text', impact: 'critical', tags: ['wcag2a', 'wcag111'], nodes: [{ target: ['img.hero'], html: '<img class="hero">', failureSummary: 'Add alt text' }] }], 'https://example.com');
  assert.equal(issue.rule, 'image-alt');
  assert.equal(issue.wcag, '1.1.1');
  assert.equal(issue.severity, 'critical');
  assert.equal(issue.selector, 'img.hero');
  assert.equal(issue.count, 1);
  assert.equal(issue.nodes[0].failureSummary, 'Add alt text');
  assert.equal(issue.fix, 'Add alt text');
});

test('closes page and browser after navigation failure', async () => {
  let pageClosed = false; let browserClosed = false;
  const page = {
    setDefaultTimeout() {}, async setBypassServiceWorker() {}, async evaluateOnNewDocument() {},
    async setViewport() {}, async setRequestInterception() {}, on() {},
    async goto() { throw new Error('navigation failed'); },
    async close() { pageClosed = true; },
  };
  await assert.rejects(scanWebsite('https://example.com', undefined, {
    validate: async value => value, launch: async () => ({ newPage: async () => page, close: async () => { browserClosed = true; } }),
  }), /navigation failed/);
  assert.equal(pageClosed, true);
  assert.equal(browserClosed, true);
});
