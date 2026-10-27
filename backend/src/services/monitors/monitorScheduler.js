import { enqueueScan, getScan } from "../../queues/scanQueue.js";
import {
  getMonitor,
  listMonitors,
  monitorInterval,
  recordMonitorRun,
  setMonitorNextRun,
} from "./monitorStore.js";

const timers = new Map();
const running = new Set();

const POLL_MS = 1500;
const SCAN_TIMEOUT_MS = 110000;
const MAX_CONCURRENT_MONITORS = 2;

function clearSchedule(id) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForScan(scanId) {
  const deadline = Date.now() + SCAN_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const job = getScan(scanId);

    if (!job) throw new Error("Scheduled scan expired.");

    if (job.status === "completed") {
      return job.result;
    }

    if (job.status === "failed") {
      throw new Error(job.error || "Scheduled scan failed.");
    }

    await sleep(POLL_MS);
  }

  throw new Error("Scheduled scan exceeded the monitoring timeout.");
}

export function runMonitor(id, scheduled = false) {
  const monitor = getMonitor(id);

  if (!monitor || !monitor.enabled || running.has(id)) {
    return false;
  }

  if (running.size >= MAX_CONCURRENT_MONITORS) {
    if (scheduled) scheduleMonitor(id, Date.now() + 60000);
    return false;
  }

  let scanId;
  try {
    scanId = enqueueScan(monitor.url);
  } catch (error) {
    return false;
  }
  clearSchedule(id);
  running.add(id);
  monitor.status = "scanning";
  monitor.nextRunAt = null;
  void waitForScan(scanId)
    .then((result) => { if (getMonitor(id)) recordMonitorRun(id, result); })
    .catch((error) => { if (getMonitor(id)) recordMonitorRun(id, null, error.message || "Scheduled scan failed."); })
    .finally(() => {
      running.delete(id);
      const latest = getMonitor(id);
      if (latest?.enabled) scheduleMonitor(id, Date.now() + monitorInterval(latest.frequency));
    });
  return true;
}

export function scheduleMonitor(id, nextTime, trigger = (monitorId) => runMonitor(monitorId, true)) {
  clearSchedule(id);

  const monitor = getMonitor(id);
  if (!monitor || !monitor.enabled || running.has(id)) return;

  const timestamp =
    nextTime ??
    (monitor.nextRunAt
      ? Date.parse(monitor.nextRunAt)
      : Date.now() + monitorInterval(monitor.frequency));

  const safeTimestamp = Number.isFinite(timestamp)
    ? timestamp
    : Date.now() + monitorInterval(monitor.frequency);

  setMonitorNextRun(id, safeTimestamp);

  const delay = Math.max(0, safeTimestamp - Date.now());

  const timer = setTimeout(() => {
    timers.delete(id);
    void trigger(id);
  }, delay);

  timer.unref();
  timers.set(id, timer);
}

export function registerMonitor(monitor) {
  scheduleMonitor(monitor.id);
  return monitor;
}

export function toggleMonitor(id, enabled) {
  clearSchedule(id);

  if (enabled) {
    scheduleMonitor(id);
  } else {
    setMonitorNextRun(id, null);
  }
}

export function removeMonitor(id) {
  clearSchedule(id);
}

export function restoreMonitorSchedules() {
  for (const monitor of listMonitors()) {
    if (monitor.enabled && !running.has(monitor.id)) {
      scheduleMonitor(monitor.id);
    }
  }
}

export function monitoringSchedulerState() {
  return {
    scheduled: timers.size,
    running: running.size,
  };
}

export function initMonitors() {
  restoreMonitorSchedules();
}
