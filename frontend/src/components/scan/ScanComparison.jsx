
import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LoaderCircle,
  X,
} from 'lucide-react';
import {
  getAvailableScans,
  compareTwoScans,
} from '../../services/compareService.js';

const categories = [
  { key: 'new', title: 'New', color: 'text-red-600 dark:text-red-400' },
  { key: 'resolved', title: 'Resolved', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'persistent', title: 'Persistent', color: 'text-orange-600 dark:text-orange-400' },
  { key: 'uncertain', title: 'Uncertain', color: 'text-zinc-600 dark:text-zinc-400' },
];

function dateLabel(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : date.toLocaleString();
}

function websiteOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function Finding({ item, category }) {
  const finding = category === 'persistent'
    ? item.after
    : item;

  return (
    <div className="rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100">
          {finding.title || finding.rule || 'Accessibility finding'}
        </span>
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {finding.severity}
        </span>
      </div>
      <p className="mt-1.5 break-all text-[11px] text-zinc-500 dark:text-zinc-400">
        {finding.rule} · {finding.pageUrl}
      </p>
      {finding.element && (
        <code className="mt-2 block break-all rounded-lg bg-zinc-50 p-2 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {finding.element}
        </code>
      )}
      {finding.reason && (
        <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
          {finding.reason}
        </p>
      )}
    </div>
  );
}

export default function ScanComparison({ currentScanId, currentUrl, open, onClose }) {
  const [scans, setScans] = useState([]);
  const [beforeId, setBeforeId] = useState('');
  const [afterId, setAfterId] = useState(currentScanId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('new');

  useEffect(() => {
    if (currentScanId) setAfterId(currentScanId);
  }, [currentScanId]);

  async function loadScans() {
    setLoading(true);
    setError('');

    try {
      const data = await getAvailableScans();
      setScans(data.scans || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.userMessage ||
        err.message ||
        'Unable to retrieve retained scans.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void loadScans();
  }, [open]);

  const current = scans.find(
    scan => scan.scanId === afterId
  );

  const targetOrigin = websiteOrigin(
    currentUrl || current?.url
  );

  const eligible = scans.filter(scan =>
    !targetOrigin ||
    websiteOrigin(scan.url) === targetOrigin
  );

  const previous = eligible.filter(
    scan => scan.scanId !== afterId
  );

  async function submit(event) {
    event.preventDefault();

    if (!beforeId || !afterId || beforeId === afterId) {
      setError('Select two different retained scans.');
      return;
    }

    setComparing(true);
    setError('');
    setResult(null);

    try {
      const comparison = await compareTwoScans(
        beforeId,
        afterId
      );
      setResult(comparison);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.userMessage ||
        err.message ||
        'Scan comparison failed.'
      );
    } finally {
      setComparing(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Compare accessibility scans"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <header className="flex items-center justify-between gap-3 border-b border-zinc-100 p-5 dark:border-zinc-800">
              <div>
                <h2 className="text-[19px] font-extrabold text-zinc-900 dark:text-zinc-100">
                  Compare accessibility scans
                </h2>
                <p className="mt-1 text-[12px] text-zinc-500">
                  Compare two completed scans retained in memory.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close comparison"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={19} />
              </button>
            </header>

            <div className="min-h-0 overflow-y-auto p-5">
              {error && (
                <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                  <AlertTriangle size={17} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
                    Previous scan
                    <select
                      required
                      value={beforeId}
                      onChange={e => setBeforeId(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[12px] font-medium outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <option value="">Select baseline</option>
                      {previous.map(scan => (
                        <option key={scan.scanId} value={scan.scanId}>
                          {dateLabel(scan.scannedAt)} · {scan.url}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
                    Current scan
                    <select
                      required
                      value={afterId}
                      onChange={e => {
                        setAfterId(e.target.value);
                        setBeforeId('');
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[12px] font-medium outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <option value="">Select current scan</option>
                      {eligible.map(scan => (
                        <option key={scan.scanId} value={scan.scanId}>
                          {dateLabel(scan.scannedAt)} · {scan.url}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {!loading && previous.length === 0 && (
                  <p className="rounded-xl bg-amber-50 p-3 text-[12px] leading-5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    No previous retained scan is available for this website.
                    Run another scan before the existing result expires.
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <Clock3 size={14} />
                    Scan results currently expire after one hour.
                  </p>
                  <button
                    type="submit"
                    disabled={loading || comparing || !beforeId || !afterId}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-[12px] font-bold text-white disabled:opacity-50 dark:bg-orange-600"
                  >
                    {comparing ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <ArrowLeftRight size={15} />
                    )}
                    {comparing ? 'Comparing...' : 'Compare scans'}
                  </button>
                </div>
              </form>

              {result && (
                <div className="mt-6 space-y-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {categories.map(category => (
                      <button
                        type="button"
                        key={category.key}
                        onClick={() => setActiveCategory(category.key)}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          activeCategory === category.key
                            ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10'
                            : 'border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <p className={`text-[22px] font-extrabold ${category.color}`}>
                          {result.counts?.[category.key] || 0}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                          {category.title}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: 'Total violations',
                        before: result.before?.summary?.total,
                        after: result.after?.summary?.total,
                        delta: result.delta?.total,
                      },
                      {
                        label: 'Affected pages',
                        before: result.before?.summary?.affectedPages,
                        after: result.after?.summary?.affectedPages,
                        delta: result.delta?.affectedPages,
                      },
                      {
                        label: 'Serious violations',
                        before: result.before?.summary?.severity?.serious,
                        after: result.after?.summary?.severity?.serious,
                        delta: result.delta?.severity?.serious,
                      },
                    ].map(metric => (
                      <div key={metric.label} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                        <p className="text-[11px] text-zinc-500">{metric.label}</p>
                        <p className="mt-1 text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
                          {metric.before ?? 0} → {metric.after ?? 0}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                          Change: {metric.delta > 0 ? '+' : ''}{metric.delta ?? 0}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                      {categories.find(category => category.key === activeCategory)?.title} findings
                    </h3>
                    <div className="space-y-2">
                      {(result.findings?.[activeCategory] || []).length ? (
                        result.findings[activeCategory].map((item, index) => (
                          <Finding
                            key={`${activeCategory}-${index}`}
                            item={item}
                            category={activeCategory}
                          />
                        ))
                      ) : (
                        <p className="rounded-xl bg-zinc-50 p-5 text-center text-[12px] text-zinc-500 dark:bg-zinc-800">
                          No findings in this category.
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="flex items-start gap-2 text-[11px] leading-5 text-zinc-500">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    Comparisons are based on retained automated scan findings.
                    Uncertain matches require manual review.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
