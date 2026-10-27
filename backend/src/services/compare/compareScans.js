function normalizeSelector(sel = '') {
  return (sel || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function keyFor(issue) {
  const page = issue.pageUrl || '';
  const rule = issue.rule || issue.id?.split('-')[0] || '';
  const sel = normalizeSelector(issue.selector);
  return `${page}|${rule}|${sel}`;
}

export function compareScans(baseline = {}, current = {}) {
  const baselineIssues = baseline.issues || [];
  const currentIssues = current.issues || [];
  const baseMap = new Map(baselineIssues.map(i => [keyFor(i), i]));
  const currMap = new Map(currentIssues.map(i => [keyFor(i), i]));
  const result = { new: [], resolved: [], persistent: [], uncertain: [] };
  for (const [k, issue] of currMap) {
    if (baseMap.has(k)) result.persistent.push(issue);
    else result.new.push(issue);
  }
  for (const [k, issue] of baseMap) {
    if (!currMap.has(k)) result.resolved.push(issue);
    else result.uncertain.push({ reason: 'Matched', issue });
  }
  const baseScore = baseline.summary?.score ?? baseline.score ?? null;
  const currScore = current.summary?.score ?? current.score ?? null;
  const baseSev = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const currSev = { ...baseSev };
  baselineIssues.forEach(i => { if (baseSev.hasOwnProperty(i.severity)) baseSev[i.severity]++; });
  currentIssues.forEach(i => { if (currSev.hasOwnProperty(i.severity)) currSev[i.severity]++; });
  return {
    new: result.new,
    resolved: result.resolved,
    persistent: result.persistent,
    uncertain: result.uncertain,
    changes: {
      score: { baseline: baseScore, current: currScore, delta: (currScore != null && baseScore != null) ? currScore - baseScore : null },
      severity: { baseline: baseSev, current: currSev },
      counts: { baseline: baselineIssues.length, current: currentIssues.length }
    }
  };
}
