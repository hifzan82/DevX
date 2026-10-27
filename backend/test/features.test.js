import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFix, generateRoadmap } from '../src/services/fixes/generateFix.js';
import { compareScans } from '../src/services/compare/compareScans.js';
import { createMonitor, listMonitors, updateMonitor, deleteMonitor } from '../src/services/monitors/monitorStore.js';

test('generateFix returns template for known rule', () => {
  const fix = generateFix({ rule: 'image-alt', wcag: '1.1.1' });
  assert.equal(fix.status, 'suggested');
  assert.ok(fix.suggestedFix.includes('alt'));
});

test('generateRoadmap sorts by priority', () => {
  const roadmap = generateRoadmap([{ id: '1', severity: 'minor', rule: 'x', count: 1 }, { id: '2', severity: 'critical', rule: 'y', count: 2 }]);
  assert.equal(roadmap.items[0].severity, 'critical');
});

test('compareScans identifies new resolved persistent', () => {
  const baseline = { issues: [{ id: '1', rule: 'image-alt', pageUrl: 'https://a.com/', selector: 'img' }] };
  const current = { issues: [{ id: '2', rule: 'image-alt', pageUrl: 'https://a.com/', selector: 'img' }, { id: '3', rule: 'label', pageUrl: 'https://a.com/', selector: 'input' }] };
  const res = compareScans(baseline, current);
  assert.equal(res.persistent.length, 1);
  assert.equal(res.new.length, 1);
  assert.equal(res.resolved.length, 0);
});

test('monitor store CRUD', () => {
  const m = createMonitor({ url: 'https://example.com', frequency: 'daily' });
  assert.ok(m.id);
  assert.equal(listMonitors().length >= 1, true);
  const updated = updateMonitor(m.id, { enabled: false });
  assert.equal(updated.enabled, false);
  assert.equal(deleteMonitor(m.id), true);
});

test('aiFix and roadmap detailed', async () => {
  const { generateAIFix, buildRoadmapDetailed } = await import('../src/services/fixes/aiFix.js');
  const fix = await generateAIFix({ rule: 'button-name', severity: 'serious', wcag: '4.1.2' });
  assert.equal(fix.validated, true);
  assert.equal(fix.generatedBy, 'template');
  const roadmap = buildRoadmapDetailed([{ id: '1', rule: 'a', severity: 'critical', count: 3 }, { id: '2', rule: 'a', severity: 'minor', count: 1 }]);
  assert.equal(roadmap.groups.length, 1);
  assert.equal(roadmap.groups[0].affectedElements, 4);
  assert.equal(roadmap.summary.rules, 1);
});
