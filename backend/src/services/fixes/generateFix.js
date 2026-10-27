const FIX_TEMPLATES = {
  'image-alt': (issue) => ({
    title: 'Add descriptive alt text',
    explanation: 'Provide meaningful alt attributes for images. Decorative images should use alt="".',
    wcag: issue.wcag || 'WCAG 1.1.1 Non-text Content',
    suggestedFix: `<img src="..." alt="Describe the image purpose here" />\n\n<!-- If decorative: <img src="..." alt="" aria-hidden="true" /> -->`,
    type: 'html'
  }),
  'label': (issue) => ({
    title: 'Associate labels with form controls',
    explanation: 'Use <label for="..."> or wrap the input. Ensure programmatic association.',
    wcag: issue.wcag || 'WCAG 1.3.1, 4.1.2',
    suggestedFix: `<label for="email">Email address</label>\n<input id="email" name="email" type="email" autocomplete="email" />`,
    type: 'html'
  }),
  'link-name': (issue) => ({
    title: 'Provide accessible link names',
    explanation: 'Links must have discernible text. Avoid empty or icon-only links without accessible names.',
    wcag: issue.wcag || 'WCAG 2.4.4, 4.1.2',
    suggestedFix: `<a href="/learn-more" aria-label="Learn more about accessibility">Learn more</a>`,
    type: 'html'
  }),
  'button-name': (issue) => ({
    title: 'Provide accessible button names',
    explanation: 'Buttons must have accessible names via text content, aria-label, or aria-labelledby.',
    wcag: issue.wcag || 'WCAG 4.1.2',
    suggestedFix: `<button type="button" aria-label="Close dialog">×</button>`,
    type: 'html'
  }),
  'color-contrast': (issue) => ({
    title: 'Ensure sufficient color contrast',
    explanation: 'Meet WCAG contrast ratios (4.5:1 for normal text, 3:1 for large text).',
    wcag: issue.wcag || 'WCAG 1.4.3, 1.4.6',
    suggestedFix: `/* Update colors */\n.text { color: #595959; background-color: #ffffff; }\n/* Contrast ratio >= 4.5:1 */`,
    type: 'css'
  }),
};

export function generateFix(issue) {
  const rule = issue?.rule || issue?.id || '';
  const template = FIX_TEMPLATES[rule];
  if (template) {
    const fix = template(issue);
    return { ...fix, rule, status: 'suggested', verified: false };
  }
  return {
    rule,
    title: 'Review and fix this issue',
    explanation: issue?.explanation || issue?.title || 'Address this accessibility violation per WCAG guidance.',
    wcag: issue?.wcag || 'See rule guidance',
    suggestedFix: issue?.fix || 'See the remediation guidance in the issue details.',
    type: 'html',
    status: 'suggested',
    verified: false,
  };
}

export function generateRoadmap(issues) {
  if (!Array.isArray(issues)) return { items: [], summary: {} };
  const priorityMap = { critical: 4, serious: 3, moderate: 2, minor: 1 };
  const items = issues.map((issue, idx) => ({
    id: issue.id || `roadmap-${idx}`,
    rule: issue.rule,
    title: issue.title,
    severity: issue.severity,
    pageUrl: issue.pageUrl,
    affected: issue.count || 1,
    priority: priorityMap[issue.severity] || 1,
    effort: issue.severity === 'critical' || issue.severity === 'serious' ? 'high' : 'medium',
    wcag: issue.wcag,
    recommendation: generateFix(issue).suggestedFix,
  }));
  items.sort((a, b) => b.priority - a.priority || b.affected - a.affected);
  const summary = {
    total: items.length,
    critical: items.filter(i => i.severity === 'critical').length,
    serious: items.filter(i => i.severity === 'serious').length,
  };
  return { items, summary };
}
