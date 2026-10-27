import { useEffect, useState } from 'react';
import { getRoadmapDetailed } from '../../services/fixService.js';

export default function RoadmapPanel({ issues = [] }) {
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!issues.length) { setRoadmap(null); setError(''); return; }
    setLoading(true);
    getRoadmapDetailed(issues).then((value) => { if (!cancelled) { setRoadmap(value); setError(''); } })
      .catch((reason) => { if (!cancelled) setError(reason.userMessage || reason.message || 'Could not load roadmap'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [issues]);

  if (!issues.length) return null;
  return (
    <section className="mt-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6" aria-label="Remediation roadmap">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Remediation roadmap</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Prioritized by severity, affected elements, pages and estimated effort. Planning aid only.</p>
        </div>
        {roadmap && <span className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">{roadmap.summary?.rules || 0} issue groups</span>}
      </div>
      {loading && <p className="mt-5 text-xs text-zinc-500" role="status">Calculating priorities…</p>}
      {error && <p className="mt-5 text-xs text-red-600" role="alert">{error}</p>}
      {roadmap && (
        <div className="mt-5 space-y-3">
          {roadmap.groups.map((item, index) => (
            <article key={item.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">Priority {index + 1} · {item.severity}</p>
                  <h3 className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{item.rule} · WCAG {item.wcag || 'Not specified'}</p>
                </div>
                <span className="rounded-lg bg-zinc-100 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Estimated effort: {item.estimatedEffort}</span>
              </div>
              <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">{item.affectedElements} affected elements · {item.affectedPages} affected pages · {item.reusable ? 'Potential reusable fix' : 'Page-specific review'}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{item.explanation}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
