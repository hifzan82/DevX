import { useEffect, useState } from 'react';
import { getScan } from '../services/scanService.js';

export default function useScanStatus(scanId, interval = 1800) {
  const [scan,setScan]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{
    setScan(null); setError('');
    if(!scanId)return undefined;
    let cancelled=false; let timer; let failures=0;
    const poll=async()=>{
      try { const result=await getScan(scanId); if(cancelled)return; failures=0; setScan(result); setError(''); if(!['completed','failed'].includes(result.status))timer=setTimeout(poll,interval); }
      catch(e){if(cancelled)return; failures+=1; if(failures < 3) timer=setTimeout(poll,interval); else setError(e.userMessage||e.message||'Could not retrieve scan status.');}
    };
    poll(); return ()=>{cancelled=true;clearTimeout(timer)};
  },[scanId,interval]);
  return { scan,error };
}
