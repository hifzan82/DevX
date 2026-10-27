const wcagCriterion = /^wcag\d{3,4}$/;

export function normalizeResults(violations, pageUrl) {
  return violations.map((violation, index) => {
    const tags = violation.tags || [];
    const criteria = tags.filter(tag => wcagCriterion.test(tag)).map(tag => {
      const digits = tag.slice(4);
      return digits.length === 3 ? digits.split('').join('.') : `${digits[0]}.${digits[1]}.${digits.slice(2)}`;
    });
    const nodes = (violation.nodes || []).map(node => ({
      selector: node.target?.join(' ') || '',
      snippet: (node.html || '').slice(0, 1200),
      failureSummary: (node.failureSummary || '').slice(0, 1200),
    }));
    return {
      id: `${violation.id}-${index}`,
      title: violation.help || violation.id,
      rule: violation.id,
      severity: violation.impact || 'moderate',
      wcag: criteria.join(', ') || 'Not specified',
      tags,
      pageUrl,
      count: nodes.length,
      selector: nodes[0]?.selector || '',
      snippet: nodes[0]?.snippet || '',
      explanation: violation.description || violation.help || '',
      fix: nodes[0]?.failureSummary || violation.help || violation.description || '',
      helpUrl: violation.helpUrl,
      nodes,
      status: 'Not tested',
    };
  });
}
