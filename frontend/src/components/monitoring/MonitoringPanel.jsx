
import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  Clock3,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Globe2,
  CalendarClock,
  ShieldCheck,
  ChevronDown,
  MonitorCheck,
  LoaderCircle,
} from 'lucide-react';
import {
  createMonitor,
  listMonitors,
  updateMonitor,
} from '../../services/monitorService.js';

export default function MonitoringPanel() {
  const [monitors, setMonitors] = useState([]);
  const [url, setUrl] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);

    try {
      const data = await listMonitors();
      setMonitors(Array.isArray(data) ? data : data.monitors || []);
      setError('');
    } catch (e) {
      setError(e.userMessage || e.message || 'Monitor API is unavailable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addMonitor(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const result = await createMonitor({
        url,
        frequency,
        alerts: true,
      });

      setMonitors((items) => [...items, result]);
      setUrl('');
      setError('');
    } catch (e) {
      setError(e.userMessage || e.message || 'Could not create monitor.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(monitor) {
    if (updatingId === monitor.id) return;

    const active = monitor.active === false;
    setUpdatingId(monitor.id);

    try {
      const updated = await updateMonitor(monitor.id, { active });

      setMonitors((items) =>
        items.map((item) =>
          item.id === monitor.id
            ? { ...item, ...updated, active }
            : item
        )
      );

      setError('');
    } catch (e) {
      setError(e.userMessage || e.message || 'Could not update monitor.');
    } finally {
      setUpdatingId(null);
    }
  }

  const activeCount = monitors.filter((item) => item.active !== false).length;
  const pausedCount = monitors.length - activeCount;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-[-1.2px] text-zinc-900 dark:text-zinc-100 sm:text-[36px]">
            Monitoring
          </h1>

          <p className="mt-2 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Schedule recurring scans and track accessibility regressions
            across your websites.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="group inline-flex h-11 w-fit items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 text-[12px] font-bold text-zinc-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? 'animate-spin'
                : 'transition-transform duration-500 group-hover:rotate-180'
            }
          />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total Websites',
            value: monitors.length,
            icon: Globe2,
            color: 'text-blue-600 dark:text-blue-400',
            background: 'bg-blue-50 dark:bg-blue-500/10',
          },
          {
            label: 'Active Monitors',
            value: activeCount,
            icon: Activity,
            color: 'text-emerald-600 dark:text-emerald-400',
            background: 'bg-emerald-50 dark:bg-emerald-500/10',
          },
          {
            label: 'Paused Monitors',
            value: pausedCount,
            icon: Pause,
            color: 'text-orange-600 dark:text-orange-400',
            background: 'bg-orange-50 dark:bg-orange-500/10',
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_3px_14px_rgba(0,0,0,0.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/10"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </span>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.background} ${stat.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon size={19} strokeWidth={1.9} />
                </div>
              </div>

              <div className="mt-5 text-[36px] font-extrabold leading-none tracking-[-1.5px] text-zinc-900 tabular-nums dark:text-zinc-100">
                {loading && !monitors.length ? '—' : stat.value}
              </div>
            </article>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.035),0_15px_40px_rgba(0,0,0,0.035)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-zinc-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400">
              <MonitorCheck size={21} strokeWidth={1.9} />
            </div>

            <div>
              <h2 className="text-[18px] font-extrabold tracking-[-0.5px] text-zinc-900 dark:text-zinc-100">
                Monitored websites
              </h2>

              <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Manage scheduled scans for your connected websites.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[10px] font-bold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            {loading ? 'LOADING' : `${monitors.length} SITES`}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 dark:border-red-900/50 dark:bg-red-950/20 sm:mx-8"
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />
            <p className="text-[12px] leading-relaxed text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        <div className="px-6 py-7 sm:px-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Plus size={18} />
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                Add a new monitor
              </h3>

              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Enter a website URL and choose how often it should be scanned.
              </p>
            </div>
          </div>

          <form
            onSubmit={addMonitor}
            className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_170px_auto] lg:items-end"
          >
            <div className="min-w-0">
              <label
                htmlFor="monitor-url"
                className="mb-2.5 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
              >
                Website URL
              </label>

              <div className="group flex h-[49px] items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 transition-all duration-200 hover:border-zinc-300 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800/60 dark:focus-within:bg-zinc-800">
                <Globe2
                  size={17}
                  className="shrink-0 text-zinc-400 group-focus-within:text-orange-500"
                />

                <input
                  id="monitor-url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] font-medium text-zinc-800 outline-none placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-0 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="monitor-frequency"
                className="mb-2.5 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
              >
                Scan frequency
              </label>

              <div className="relative">
                <CalendarClock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <select
                  id="monitor-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="h-[49px] w-full cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-10 pr-9 text-[12px] font-semibold text-zinc-700 outline-none transition-all hover:border-zinc-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group flex h-[49px] items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-5 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              {submitting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Plus
                  size={17}
                  className="transition-transform duration-200 group-hover:rotate-90"
                />
              )}
              {submitting ? 'Adding...' : 'Add monitor'}
            </button>
          </form>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3 bg-zinc-50/60 px-6 py-4 sm:px-8 dark:bg-zinc-800/30">
            <h3 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
              Your monitors
            </h3>

            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {monitors.length} configured
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[230px] flex-col items-center justify-center gap-3">
              <LoaderCircle
                size={26}
                className="animate-spin text-orange-500"
              />
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                Loading monitors...
              </p>
            </div>
          ) : monitors.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {monitors.map((item) => {
                const isActive = item.active !== false;
                const isUpdating = updatingId === item.id;

                return (
                  <article
                    key={item.id}
                    className="group flex flex-col gap-4 px-6 py-5 transition-colors duration-200 hover:bg-zinc-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:hover:bg-zinc-800/30"
                  >
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                          isActive
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <Activity size={20} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4
                            className="break-all text-[13px] font-bold text-zinc-800 dark:text-zinc-200"
                          >
                            {item.url}
                          </h4>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive
                                  ? 'bg-emerald-500'
                                  : 'bg-zinc-400'
                              }`}
                            />
                            {isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarClock size={13} />
                            <span className="capitalize">
                              {item.frequency || 'Scheduled'}
                            </span>
                          </span>

                          <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block dark:bg-zinc-600" />

                          <span className="flex items-center gap-1.5">
                            <Clock3 size={13} />
                            Next: {item.nextRunAt || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      disabled={isUpdating}
                      className={`inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-[11px] font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${
                        isActive
                          ? 'border-zinc-200 bg-white text-zinc-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                      }`}
                    >
                      {isUpdating ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : isActive ? (
                        <Pause size={15} />
                      ) : (
                        <Play size={15} />
                      )}

                      {isUpdating
                        ? 'Updating...'
                        : isActive
                        ? 'Pause'
                        : 'Resume'}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                <CalendarClock size={28} strokeWidth={1.6} />
              </div>

              <h3 className="mt-5 text-[16px] font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
                No monitors configured
              </h3>

              <p className="mt-2 max-w-[350px] text-[12px] leading-6 text-zinc-500 dark:text-zinc-400">
                Add your first website above to schedule recurring
                accessibility scans. Schedules will be saved when the
                backend monitor API is available.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 border-t border-zinc-100 bg-zinc-50/60 px-6 py-5 sm:px-8 dark:border-zinc-800 dark:bg-zinc-800/20">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
          />

          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Scheduled scans are managed by the backend. Monitoring helps
            identify new accessibility findings, but automated results do
            not establish WCAG conformance.
          </p>
        </div>
      </section>
    </div>
  );
}
