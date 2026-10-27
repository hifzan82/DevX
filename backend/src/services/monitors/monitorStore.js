import { randomUUID } from "node:crypto";

const monitors = new Map();
const DAY = 24 * 60 * 60 * 1000;
const RESULT_RETENTION = 30 * DAY;
const MAX_RESULTS = 10;

export function monitorInterval(frequency) {
  if (frequency === "daily") return DAY;
  if (frequency === "weekly") return 7 * DAY;
  throw new Error("Frequency must be daily or weekly.");
}

function compactIssues(issues = []) {
  const findings = issues
    .flatMap((issue) => {
      const nodes =
        Array.isArray(issue.nodes) && issue.nodes.length
          ? issue.nodes
          : [{ selector: issue.selector || "" }];

      return nodes.slice(0, 50).map((node) => ({
        rule: String(issue.rule || ""),
        severity: String(issue.severity || "moderate"),
        pageUrl: normalizePageUrl(issue.pageUrl),
        selector: String(node.selector || issue.selector || "").trim().slice(0, 500),
      }));
    })
    .slice(0, 3000);
  return [...new Map(findings.map((item) => [identity(item), item])).values()];
}

function normalizePageUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.searchParams.sort();
    return url.toString();
  } catch { return String(value || ""); }
}

function identity(issue) {
  return JSON.stringify([issue.pageUrl, issue.rule, issue.selector]);
}

export function compareMonitorIssues(previous = [], current = []) {
  const before = new Map(previous.map((item) => [identity(item), item]));
  const after = new Map(current.map((item) => [identity(item), item]));

  return {
    new: [...after].filter(([key]) => !before.has(key)).map(([, item]) => item),
    resolved: [...before].filter(([key]) => !after.has(key)).map(([, item]) => item),
    persistent: [...after].filter(([key]) => before.has(key)).map(([, item]) => item),
  };
}

export function createMonitor({ url, frequency = "daily", enabled = true }) {
  monitorInterval(frequency);

  if ([...monitors.values()].some((item) => item.url === url)) {
    const error = new Error("This website is already monitored.");
    error.statusCode = 409;
    throw error;
  }

  const now = Date.now();

  const monitor = {
    id: randomUUID(),
    url,
    frequency,
    enabled: Boolean(enabled),
    status: enabled ? "active" : "paused",
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    lastRunAt: null,
    nextRunAt: enabled
      ? new Date(now + monitorInterval(frequency)).toISOString()
      : null,
    lastError: null,
    results: [],
    baseline: null,
    baselineAt: null,
  };

  monitors.set(monitor.id, monitor);
  return monitor;
}

export function listMonitors() {
  return [...monitors.values()];
}

export function getMonitor(id) {
  return monitors.get(id);
}

export function updateMonitor(id, updates = {}) {
  const monitor = monitors.get(id);
  if (!monitor) throw new Error("Monitor not found.");

  if (updates.frequency !== undefined) {
    monitorInterval(updates.frequency);
    monitor.frequency = updates.frequency;
  }

  if (updates.enabled !== undefined) {
    if (typeof updates.enabled !== "boolean") {
      throw new Error("Enabled must be a boolean.");
    }
    monitor.enabled = updates.enabled;
  }

  monitor.status = monitor.enabled ? "active" : "paused";
  monitor.nextRunAt = monitor.enabled
    ? new Date(Date.now() + monitorInterval(monitor.frequency)).toISOString()
    : null;
  monitor.updatedAt = new Date().toISOString();

  return monitor;
}

export function setMonitorNextRun(id, timestamp) {
  const monitor = monitors.get(id);
  if (!monitor) return null;

  monitor.nextRunAt =
    monitor.enabled && timestamp ? new Date(timestamp).toISOString() : null;

  return monitor;
}

export function deleteMonitor(id) {
  return monitors.delete(id);
}

export function recordMonitorRun(id, result, error = null) {
  const monitor = monitors.get(id);
  if (!monitor) return null;

  const now = Date.now();
  const previous = monitor.baselineAt && now - Date.parse(monitor.baselineAt) <= RESULT_RETENTION ? monitor.baseline : null;
  const current = error ? null : compactIssues(result?.issues || []);

  const changes =
    previous && current ? compareMonitorIssues(previous, current) : null;

  const entry = {
    runAt: new Date(now).toISOString(),
    status: error ? "failed" : "completed",
    summary: error ? {} : result?.summary || {},
    issues: current?.length || 0,
    regression: changes
      ? {
          new: changes.new.length,
          resolved: changes.resolved.length,
          persistent: changes.persistent.length,
        }
      : null,
    changes,
    error: error || null,
  };

  monitor.results.unshift(entry);
  monitor.results = monitor.results
    .filter((item) => now - Date.parse(item.runAt) <= RESULT_RETENTION)
    .slice(0, MAX_RESULTS);

  if (current) { monitor.baseline = current; monitor.baselineAt = entry.runAt; }

  monitor.lastRunAt = entry.runAt;
  monitor.lastError = error || null;
  monitor.status = monitor.enabled ? "active" : "paused";
  monitor.updatedAt = entry.runAt;

  return entry;
}

export function dueMonitors() {
  const now = Date.now();
  return listMonitors().filter(
    (monitor) =>
      monitor.enabled &&
      monitor.nextRunAt &&
      Date.parse(monitor.nextRunAt) <= now,
  );
}

setInterval(
  () => {
    const cutoff = Date.now() - RESULT_RETENTION;

    for (const monitor of monitors.values()) {
      monitor.results = monitor.results
        .filter((item) => Date.parse(item.runAt) >= cutoff)
        .slice(0, MAX_RESULTS);
      if (monitor.baselineAt && Date.parse(monitor.baselineAt) < cutoff) {
        monitor.baseline = null;
        monitor.baselineAt = null;
      }
    }
  },
  60 * 60 * 1000,
).unref();
