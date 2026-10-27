import test from 'node:test';
import assert from 'node:assert/strict';
import { createMonitor, deleteMonitor, getMonitor, monitorInterval, recordMonitorRun, updateMonitor } from '../src/services/monitors/monitorStore.js';
import { monitoringSchedulerState, registerMonitor, removeMonitor, scheduleMonitor, toggleMonitor } from '../src/services/monitors/monitorScheduler.js';

test('daily and weekly schedules have one timer and pause/resume cleanly', () => {
  const monitor = createMonitor({ url: 'https://schedule.example/', frequency: 'daily' });
  try {
    assert.equal(monitorInterval('daily'), 24 * 60 * 60 * 1000);
    assert.equal(monitorInterval('weekly'), 7 * 24 * 60 * 60 * 1000);
    const before = monitoringSchedulerState().scheduled;
    registerMonitor(monitor);
    assert.equal(monitoringSchedulerState().scheduled, before + 1);
    scheduleMonitor(monitor.id);
    assert.equal(monitoringSchedulerState().scheduled, before + 1);
    updateMonitor(monitor.id, { enabled: false });
    toggleMonitor(monitor.id, false);
    assert.equal(monitoringSchedulerState().scheduled, before);
    assert.equal(getMonitor(monitor.id).nextRunAt, null);
    updateMonitor(monitor.id, { enabled: true, frequency: 'weekly' });
    toggleMonitor(monitor.id, true);
    assert.equal(monitoringSchedulerState().scheduled, before + 1);
    const untilRun = Date.parse(getMonitor(monitor.id).nextRunAt) - Date.now();
    assert.ok(untilRun > 6 * 24 * 60 * 60 * 1000 && untilRun <= monitorInterval('weekly'));
  } finally {
    removeMonitor(monitor.id);
    deleteMonitor(monitor.id);
  }
});

test('a scheduled monitor fires once at its due time', async () => {
  const monitor = createMonitor({ url: 'https://due.example/', frequency: 'daily' });
  let calls = 0;
  try {
    await new Promise((resolve) => {
      scheduleMonitor(monitor.id, Date.now() + 20, () => { calls += 1; resolve(); });
    });
    assert.equal(calls, 1);
    assert.equal(monitoringSchedulerState().scheduled, 0);
  } finally { removeMonitor(monitor.id); deleteMonitor(monitor.id); }
});

test('monitor snapshots classify regressions and cap retained runs', () => {
  const monitor = createMonitor({ url: 'https://regression.example/', frequency: 'daily' });
  try {
    const image = { rule: 'image-alt', severity: 'critical', pageUrl: 'https://regression.example/#top', nodes: [{ selector: 'img.hero' }] };
    const label = { rule: 'label', severity: 'serious', pageUrl: 'https://regression.example/', nodes: [{ selector: 'input#email' }] };
    const first = recordMonitorRun(monitor.id, { issues: [image, image], summary: { total: 2 } });
    assert.equal(first.regression, null);
    assert.equal(first.issues, 1);
    const second = recordMonitorRun(monitor.id, { issues: [image, label], summary: { total: 2 } });
    assert.deepEqual(second.regression, { new: 1, resolved: 0, persistent: 1 });
    const third = recordMonitorRun(monitor.id, { issues: [label], summary: { total: 1 } });
    assert.deepEqual(third.regression, { new: 0, resolved: 1, persistent: 1 });
    for (let index = 0; index < 12; index += 1) recordMonitorRun(monitor.id, { issues: [], summary: { total: 0 } });
    assert.equal(getMonitor(monitor.id).results.length, 10);
  } finally { deleteMonitor(monitor.id); }
});
