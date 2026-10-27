import { ArrowDownUp,ArrowUpRight,FileDown,Github } from 'lucide-react';

export default function ReportActions({ onExport,onCompare,onPullRequest }) {
  return <section className="bottom-actions"><div className="bottom-heading"><div><h2>Next steps</h2><p>Take your audit further</p></div><span>WORKFLOW</span></div><div className="action-tiles"><button onClick={onExport}><span className="tile-icon"><FileDown size={17}/></span><span><strong>Export report</strong><small>Download findings as CSV</small></span><ArrowUpRight size={15}/></button><button onClick={onCompare}><span className="tile-icon"><ArrowDownUp size={17}/></span><span><strong>Compare scans</strong><small>Track changes over time</small></span><ArrowUpRight size={15}/></button><button onClick={onPullRequest}><span className="tile-icon"><Github size={17}/></span><span><strong>Review fixes &amp; create PR</strong><small>Review changes before sharing</small></span><ArrowUpRight size={15}/></button></div></section>;
}
