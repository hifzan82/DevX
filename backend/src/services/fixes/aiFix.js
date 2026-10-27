import { generateFix } from './generateFix.js';

function sanitizeContext(issue) {
  return {
    rule: issue?.rule,
    severity: issue?.severity,
    wcag: issue?.wcag,
    selector: issue?.selector?.slice(0, 200),
    snippet: (issue?.snippet || '').slice(0, 400),
    count: issue?.count,
  };
}

export async function generateAIFix(issue) {
  const ctx = sanitizeContext(issue);
  const base = generateFix(issue);
  return {
    ...base,
    context: ctx,
    generatedBy: 'template',
    validated: true,
    note: 'Template-based suggestion (unverified).',
  };
}

export function buildRoadmapDetailed(issues) {
  if (!Array.isArray(issues)) return { items: [], groups: [], summary: {} };
  const priorityMap = { critical: 4, serious: 3, moderate: 2, minor: 1 };
  const effortMap = { critical: 'high', serious: 'high', moderate: 'medium', minor: 'low' };
  const items = issues.map((issue, idx) => {
    const affectedPages = issue.pageUrl ? 1 : 1;
    const affectedElements = issue.count || 1;
    return {
      id: issue.id || `roadmap-${idx}`,
      rule: issue.rule,
      title: issue.title,
      severity: issue.severity,
      pageUrl: issue.pageUrl,
      affectedElements,
      affectedPages,
      wcag: issue.wcag,
      priority: priorityMap[issue.severity] || 1,
      effort: effortMap[issue.severity] || 'medium',
      estimatedEffort: effortMap[issue.severity] || 'medium',
      explanation: generateFix(issue).explanation,
      suggestion: generateFix(issue).suggestedFix,
      tags: issue.tags || [],
    };
  });
  items.sort((a, b) => (b.priority - a.priority) || (b.affectedElements - a.affectedElements));
  // Group by rule
  const groups = {};
  items.forEach(item => {
    if (!groups[item.rule]) groups[item.rule] = { rule: item.rule, items: [], count: 0 };
    groups[item.rule].items.push(item);
    groups[item.rule].count += item.affectedElements;
  });
  const groupList = Object.values(groups).map(g => {
    const first = g.items[0];
    return {
      ...g,
      id: first.rule,
      title: first.title,
      severity: first.severity,
      wcag: first.wcag,
      estimatedEffort: first.estimatedEffort,
      affectedElements: g.count,
      affectedPages: new Set(g.items.map(item => item.pageUrl).filter(Boolean)).size || 1,
      explanation: first.explanation,
      reusable: g.items.length > 1,
    };
  });
  return {
    items,
    groups: groupList,
    summary: {
      total: items.length,
      rules: groupList.length,
      critical: items.filter(i => i.severity === 'critical').length,
      serious: items.filter(i => i.severity === 'serious').length,
      totalElements: items.reduce((s, i) => s + i.affectedElements, 0),
    }
  };
}
