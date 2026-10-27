import { useEffect, useState } from 'react';
import { getCrawl } from '../services/crawlService.js';

export default function useCrawlStatus(crawlId, interval = 1800) {
  const [crawl, setCrawl] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setCrawl(null); setError('');
    if (!crawlId) return undefined;
    let cancelled = false; let timer; let failures = 0;
    const poll = async () => {
      try {
        const result = await getCrawl(crawlId);
        if (cancelled) return;
        failures = 0; setCrawl(result); setError('');
        if (!['completed', 'failed'].includes(result.status)) timer = setTimeout(poll, interval);
      } catch (cause) {
        if (cancelled) return;
        failures += 1;
        if (failures < 3) timer = setTimeout(poll, interval);
        else setError(cause.userMessage || cause.message || 'Could not retrieve crawl status.');
      }
    };
    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [crawlId, interval]);
  return { crawl, error };
}
