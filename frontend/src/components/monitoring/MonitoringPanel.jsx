
import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  Clock3,
  Globe2,
  LoaderCircle,
  MonitorCheck,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  createMonitor,
  listMonitors,
  updateMonitor,
  deleteMonitor,
  runMonitorNow,
} from '../../services/monitorService.js';

const buttonBase =
  'inline-flex h-10 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3.5 text-[11px] font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0';

const neutralButton =
  `${buttonBase} border-zinc-200 bg-white text-zinc-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400`;

function formatDate(value) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function MonitorCard({
  monitor,
  updating,
  deleting,
  running,
  onToggle,
  onRun,
  onRemove,
}) {
  const active = monitor.enabled ?? monitor.active ?? false;
  const scanning = monitor.status === 'scanning';
  const busy = updating || deleting || running;
  const last = monitor.results?.[0];
  const regression = last?.regression;

  return (
    <article className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_3px_12px_rgba(0,0,0,0.035)] transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 sm:p-5">
      <div className="flex min-w-0 items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
            active
              ? 'border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <Globe2 size={19} strokeWidth={1.9} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              title={monitor.url}
              className="min-w-0 max-w-full break-all text-[13px] font-bold leading-relaxed text-zinc-900 hover:text-orange-600 dark:text-zinc-100 dark:hover:text-orange-400 sm:text-[14px]"
            >
              {monitor.url}
            </a>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                scanning
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                  : active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  scanning
                    ? 'animate-pulse bg-blue-500'
                    : active
                      ? 'bg-emerald-500'
                      : 'bg-zinc-400'
                }`}
              />
              {scanning ? 'Scanning' : active ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="mt-3 grid gap-x-6 gap-y-2 text-[11px] text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarClock size={14} className="shrink-0 text-zinc-400" />
              <span className="font-medium capitalize">
                {monitor.frequency || 'Scheduled'} scans
              </span>
            </div>

            <div className="flex min-w-0 items-start gap-2">
              <Clock3 size={14} className="mt-0.5 shrink-0 text-zinc-400" />
              <span className="min-w-0">
                Next: {formatDate(monitor.nextRunAt)}
              </span>
            </div>
          </div>

          {last && (
            <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-2.5 text-[11px] leading-5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  Last scan: {formatDate(last.runAt)}
                </span>
                <span className="font-semibold">
                  {last.status === 'completed'
                    ? `${last.summary?.total ?? 0} findings`
                    : last.error || 'Scan failed'}
                </span>
              </div>

              {regression && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-md bg-red-50 px-2 py-1 font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    {regression.new ?? 0} new
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {regression.resolved ?? 0} resolved
                  </span>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {regression.persistent ?? 0} persistent
                  </span>
                </div>
              )}
            </div>
          )}

          {monitor.lastError && !last && (
            <p className="mt-3 text-[11px] text-red-600 dark:text-red-400">
              {monitor.lastError}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex sm:flex-wrap sm:justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggle(monitor)}
          className={neutralButton}
        >
          {updating ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : active ? (
            <Pause size={15} />
          ) : (
            <Play size={15} />
          )}
          {updating ? 'Updating...' : active ? 'Pause' : 'Resume'}
        </button>

        <button
          type="button"
          disabled={!active || scanning || busy}
          onClick={() => onRun(monitor)}
          className={neutralButton}
        >
          {running || scanning ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Play size={15} />
          )}
          {running || scanning ? 'Scanning...' : 'Run now'}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(monitor)}
          className={`${buttonBase} col-span-2 border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20`}
        >
          {deleting ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
          {deleting ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </article>
  );
}

export default function MonitoringPanel() {
  const [monitors, setMonitors] = useState([]);
  const [url, setUrl] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [runningId, setRunningId] = useState(null);
  const [error, setError] = useState('');

  async function refresh(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await listMonitors();
      setMonitors(Array.isArray(data) ? data : data.monitors || []);
      setError('');
    } catch (err) {
      setError(err.userMessage || err.message || 'Monitor API is unavailable.');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh(true);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  async function addMonitor(event) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const result = await createMonitor({ url: url.trim(), frequency });
      setMonitors(items => [...items.filter(item => item.id !== result.id), result]);
      setUrl('');
      setError('');
    } catch (err) {
      setError(err.userMessage || err.message || 'Could not add monitor.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(monitor) {
    if (updatingId === monitor.id) return;
    setUpdatingId(monitor.id);

    try {
      const active = !(monitor.enabled ?? monitor.active ?? false);
      const updated = await updateMonitor(monitor.id, { active });
      setMonitors(items =>
        items.map(item => item.id === monitor.id ? { ...item, ...updated } : item)
      );
      setError('');
    } catch (err) {
      setError(err.userMessage || err.message || 'Could not update monitor.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeMonitor(monitor) {
    if (!window.confirm(`Remove monitoring for ${monitor.url}?`)) return;

    setDeletingId(monitor.id);
    try {
      await deleteMonitor(monitor.id);
      setMonitors(items => items.filter(item => item.id !== monitor.id));
      setError('');
    } catch (err) {
      setError(err.userMessage || err.message || 'Could not remove monitor.');
    } finally {
      setDeletingId(null);
    }
  }

  async function runNow(monitor) {
    if (runningId === monitor.id) return;
    setRunningId(monitor.id);

    try {
      const updated = await runMonitorNow(monitor.id);
      if (updated?.id) {
        setMonitors(items =>
          items.map(item => item.id === monitor.id ? { ...item, ...updated } : item)
        );
      }
      setError('');
      await refresh(true);
    } catch (err) {
      setError(err.userMessage || err.message || 'Could not run monitor.');
    } finally {
      setRunningId(null);
    }
  }

  const activeCount = monitors.filter(
    item => (item.enabled ?? item.active) !== false
  ).length;

  const stats = [
    {
      label: 'Total websites',
      value: monitors.length,
      icon: Globe2,
      color: 'text-blue-600 dark:text-blue-400',
      background: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: 'Active monitors',
      value: activeCount,
      icon: Activity,
      color: 'text-emerald-600 dark:text-emerald-400',
      background: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Paused monitors',
      value: monitors.length - activeCount,
      icon: Pause,
      color: 'text-orange-600 dark:text-orange-400',
      background: 'bg-orange-50 dark:bg-orange-500/10',
    },
  ];

  return (
    <div className="min-w-0 space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[30px] font-extrabold tracking-[-1.2px] text-zinc-900 dark:text-zinc-100 sm:text-[36px]">
            Monitoring
          </h1>
          <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-zinc-500 dark:text-zinc-400">
            Schedule recurring scans and track accessibility regressions across your websites.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          className={`${neutralButton} h-11 w-fit shrink-0 px-4`}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.035)] transition-shadow duration-200 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="pt-1 text-[11px] font-bold uppercase tracking-[0.05em] text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </span>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color} ${stat.background}`}>
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-5 text-[34px] font-extrabold leading-none tracking-[-1px] text-zinc-900 dark:text-zinc-100">
                {stat.value}
              </p>
            </article>
          );
        })}
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.035),0_15px_40px_rgba(0,0,0,0.035)] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400">
              <MonitorCheck size={21} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Monitored websites
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
                Manage scheduled scans for your connected websites.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[10px] font-bold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            {monitors.length} {monitors.length === 1 ? 'SITE' : 'SITES'}
          </span>
        </div>

        {error && (
          <div role="alert" className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:mx-7">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p className="min-w-0 break-words text-[12px] leading-5">
              {error}
            </p>
          </div>
        )}

        <div className="px-5 py-6 sm:px-7">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Plus size={18} />
            </span>
            <div>
              <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                Add a new monitor
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
                Enter a website URL and choose how often it should be scanned.
              </p>
            </div>
          </div>

          <form
            onSubmit={addMonitor}
            className="grid min-w-0 grid-cols-1 items-end gap-4 md:grid-cols-[minmax(0,1fr)_170px] xl:grid-cols-[minmax(0,1fr)_180px_155px]"
          >
            <div className="min-w-0">
              <label htmlFor="monitor-url" className="mb-2 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
                Website URL
              </label>
              <div className="flex h-[49px] min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 transition-colors focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800/60">
                <Globe2 size={17} className="shrink-0 text-zinc-400" />
                <input
                  id="monitor-url"
                  type="url"
                  required
                  value={url}
                  onChange={event => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="h-full w-full min-w-0 flex-1 border-0 bg-transparent text-[12px] text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label htmlFor="monitor-frequency" className="mb-2 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
                Scan frequency
              </label>
              <div className="relative">
                <CalendarClock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <select
                  id="monitor-frequency"
                  value={frequency}
                  onChange={event => setFrequency(event.target.value)}
                  className="h-[49px] w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-10 pr-9 text-[12px] font-semibold text-zinc-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-[49px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-[12px] font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 disabled:opacity-50 md:col-span-2 xl:col-span-1 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              {submitting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Plus size={17} />
              )}
              {submitting ? 'Adding...' : 'Add monitor'}
            </button>
          </form>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3 bg-zinc-50/60 px-5 py-4 dark:bg-zinc-800/30 sm:px-7">
            <h3 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
              Your monitors
            </h3>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {monitors.length} configured
            </span>
          </div>

          {loading && !monitors.length ? (
            <div className="flex min-h-[210px] flex-col items-center justify-center gap-3">
              <LoaderCircle size={25} className="animate-spin text-orange-500" />
              <p className="text-[12px] text-zinc-500">Loading monitors...</p>
            </div>
          ) : monitors.length ? (
            <div className="grid min-w-0 gap-4 p-4 sm:p-6">
              {monitors.map(monitor => (
                <MonitorCard
                  key={monitor.id}
                  monitor={monitor}
                  updating={updatingId === monitor.id}
                  deleting={deletingId === monitor.id}
                  running={runningId === monitor.id}
                  onToggle={toggle}
                  onRun={runNow}
                  onRemove={removeMonitor}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                <CalendarClock size={28} />
              </span>
              <h3 className="mt-5 text-[16px] font-bold text-zinc-800 dark:text-zinc-200">
                No monitors configured
              </h3>
              <p className="mt-2 max-w-[350px] text-[12px] leading-6 text-zinc-500 dark:text-zinc-400">
                Add your first website to schedule recurring scans.
                Monitoring data is cleared when the backend restarts.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 border-t border-zinc-100 bg-zinc-50/60 px-5 py-5 dark:border-zinc-800 dark:bg-zinc-800/20 sm:px-7">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[11px] leading-6 text-zinc-500 dark:text-zinc-400">
            Scheduled scans use temporary backend memory. Restarting the
            backend clears monitors and results. Automated findings do not
            establish WCAG conformance.
          </p>
        </div>
      </section>
    </div>
  );
}
