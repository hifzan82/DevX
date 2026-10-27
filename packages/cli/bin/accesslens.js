#!/usr/bin/env node
import { scanUrl } from '../src/index.js';

const args = process.argv.slice(2);
const url = args.find(a => a.startsWith('http'));
const format = args.includes('--json') ? 'json' : args.includes('--csv') ? 'csv' : 'text';

if (!url) {
  console.error('Usage: accesslens <url> [--json|--csv]');
  process.exit(1);
}

try {
  const result = await scanUrl(url);
  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else if (format === 'csv') {
    const rows = [['Rule', 'Severity', 'Count', 'Page']];
    (result.issues || []).forEach(issue => rows.push([issue.rule, issue.severity, issue.count, result.url]));
    console.log(rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'));
  } else {
    console.log(`AccessLens scan: ${result.url}`);
    (result.issues || []).forEach(issue => console.log(`- [${issue.severity}] ${issue.rule}: ${issue.count}`));
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
