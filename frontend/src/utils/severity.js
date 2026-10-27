export const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3, info: 4 };

export function sortBySeverity(issues = []) {
  return [...issues].sort((a,b)=>(severityOrder[a.severity]??99)-(severityOrder[b.severity]??99));
}

export function countBySeverity(issues = []) {
  return issues.reduce((counts,issue)=>{counts[issue.severity]=(counts[issue.severity]||0)+(Number(issue.count)||1);return counts;},{});
}
