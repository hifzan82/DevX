const TRACKING_KEYS = /^(utm_.+|fbclid|gclid|msclkid)$/i;

export function normalizePageUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();

    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_KEYS.test(key)) {
        url.searchParams.delete(key);
      }
    }

    url.searchParams.sort();

    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

function websiteOrigin(value) {
  const url = normalizePageUrl(value);
  return url ? new URL(url).origin : null;
}

function severityOf(issue) {
  const severity = String(
    issue.severity || issue.impact || "unknown",
  ).toLowerCase();

  const aliases = {
    high: "serious",
    medium: "moderate",
    low: "minor",
  };

  return aliases[severity] || severity;
}

function elementOf(issue) {
  const candidates = [
    issue.selector,
    ...(Array.isArray(issue.selectors) ? issue.selectors : []),
    ...(Array.isArray(issue.nodes)
      ? issue.nodes.flatMap((node) => [
          node.selector,
          ...(Array.isArray(node.target) ? node.target : []),
        ])
      : []),
  ];

  const selector = candidates.find(
    (item) => typeof item === "string" && item.trim(),
  );

  if (!selector) return null;

  const normalized = selector.replace(/\s+/g, " ").trim();

  if (
    /:nth-(child|of-type)\(/i.test(normalized) ||
    /:nth-child/i.test(normalized)
  ) {
    return null;
  }

  return normalized;
}

function findingsFromScan(scan) {
  const issues = Array.isArray(scan.issues) ? scan.issues : [];

  return issues.map((issue, index) => {
    const pageUrl = normalizePageUrl(issue.pageUrl || issue.url || scan.url);

    const rule = String(issue.rule || issue.ruleId || issue.id || "");

    const element = elementOf(issue);
    const reliable = Boolean(pageUrl && rule && element);

    return {
      id: `${index}`,
      pageUrl,
      rule,
      element,
      severity: severityOf(issue),
      count: Math.max(1, Number(issue.count) || 1),
      title: issue.title || issue.help || rule,
      reliable,
      reason: reliable
        ? null
        : "A stable page, rule, or element identifier is missing.",
    };
  });
}

function findingKey(finding) {
  return JSON.stringify([finding.pageUrl, finding.rule, finding.element]);
}

function groupByKey(items) {
  const groups = new Map();

  for (const item of items) {
    const key = findingKey(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }

  return groups;
}

function aggregate(items) {
  const severity = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
  };

  let total = 0;
  const pages = new Set();

  for (const item of items) {
    total += item.count;
    severity[item.severity] = (severity[item.severity] || 0) + item.count;

    if (item.pageUrl) pages.add(item.pageUrl);
  }

  return {
    total,
    findings: items.length,
    severity,
    affectedPages: pages.size,
    pages: [...pages].sort(),
  };
}

export function compareScans(beforeScan, afterScan) {
  const beforeOrigin = websiteOrigin(beforeScan?.url);
  const afterOrigin = websiteOrigin(afterScan?.url);

  if (!beforeOrigin || !afterOrigin) {
    throw new Error("Both scans must have valid website URLs.");
  }

  if (beforeOrigin !== afterOrigin) {
    throw new Error("Scans must belong to the same website origin.");
  }

  const before = findingsFromScan(beforeScan);
  const after = findingsFromScan(afterScan);

  const previousGroups = groupByKey(before.filter((item) => item.reliable));

  const currentGroups = groupByKey(after.filter((item) => item.reliable));

  const newFindings = [];
  const resolved = [];
  const persistent = [];
  const uncertain = [
    ...before
      .filter((item) => !item.reliable)
      .map((item) => ({
        ...item,
        source: "before",
      })),
    ...after
      .filter((item) => !item.reliable)
      .map((item) => ({
        ...item,
        source: "after",
      })),
  ];

  const keys = new Set([...previousGroups.keys(), ...currentGroups.keys()]);

  for (const key of keys) {
    const previous = previousGroups.get(key) || [];
    const current = currentGroups.get(key) || [];

    const matches = Math.min(previous.length, current.length);

    for (let i = 0; i < matches; i++) {
      persistent.push({
        before: previous[i],
        after: current[i],
      });
    }

    for (let i = matches; i < previous.length; i++) {
      resolved.push(previous[i]);
    }

    for (let i = matches; i < current.length; i++) {
      newFindings.push(current[i]);
    }
  }

  const beforeSummary = aggregate(before);
  const afterSummary = aggregate(after);

  const severityDelta = {};

  for (const level of new Set([
    ...Object.keys(beforeSummary.severity),
    ...Object.keys(afterSummary.severity),
  ])) {
    severityDelta[level] =
      (afterSummary.severity[level] || 0) -
      (beforeSummary.severity[level] || 0);
  }

  return {
    website: beforeOrigin,
    baselineAvailable: true,
    before: {
      url: beforeScan.url,
      scannedAt: beforeScan.scannedAt || null,
      summary: beforeSummary,
    },
    after: {
      url: afterScan.url,
      scannedAt: afterScan.scannedAt || null,
      summary: afterSummary,
    },
    delta: {
      total: afterSummary.total - beforeSummary.total,
      affectedPages: afterSummary.affectedPages - beforeSummary.affectedPages,
      severity: severityDelta,
    },
    counts: {
      new: newFindings.length,
      resolved: resolved.length,
      persistent: persistent.length,
      uncertain: uncertain.length,
    },
    findings: {
      new: newFindings,
      resolved,
      persistent,
      uncertain,
    },
  };
}
