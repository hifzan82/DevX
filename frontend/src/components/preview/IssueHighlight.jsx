import { useEffect } from 'react';

export default function IssueHighlight({ frameRef, selector }) {
  useEffect(() => {
    const frame=frameRef?.current;
    if(!frame)return;
    const highlight=()=>{
      const document=frame.contentDocument;
      if(!document)return;
      document.querySelectorAll('.broken').forEach(element=>element.classList.remove('broken'));
      if(!selector)return;
      try { document.querySelectorAll(selector).forEach(element=>{element.classList.add('broken');element.scrollIntoView({behavior:'smooth',block:'center'})}) }
      catch { /* A stale selector is safe to ignore. */ }
    };
    frame.addEventListener('load',highlight);
    highlight();
    return ()=>frame.removeEventListener('load',highlight);
  }, [frameRef, selector]);
  return null;
}
