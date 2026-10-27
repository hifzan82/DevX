import { AlertTriangle, LoaderCircle } from 'lucide-react';

export default function ScanProgress({ state, error, demo }) {
  if (state === 'idle' && !error) return null;
  const pending = ['queued','processing','scanning'].includes(state);
  return <>{state!=='idle'&&<div className="scan-status"><span className={`status-dot ${state==='failed'?'dot-red':''}`}/><strong>{state==='demo'?'Sample audit loaded':state[0].toUpperCase()+state.slice(1)}</strong><span>{state==='demo'?'Results below are representative demo data, not findings from your URL.':state==='failed'?error:'Scan status is provided by your API.'}</span>{pending&&<LoaderCircle className="spin" size={15}/>}</div>}{error&&<div className="inline-message" role="status"><AlertTriangle size={14}/>{error}</div>}</>;
}
