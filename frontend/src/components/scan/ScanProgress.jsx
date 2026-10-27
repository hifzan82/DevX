
import {
  AlertTriangle,
  LoaderCircle,
  CheckCircle2,
  Clock3,
  Activity,
  Info,
} from 'lucide-react';

export default function ScanProgress({ state, error, stage, progress = 0, mode = 'scan' }) {
  if (state === 'idle' && !error) return null;

  const pending = ['queued', 'processing', 'scanning'].includes(state);
  const failed = state === 'failed';
  const completed = state === 'completed';
  const isDemo = state === 'demo';

  const statusConfig = {
    queued: {
      label: mode === 'crawl' ? 'Crawl queued' : 'Scan queued',
      description: 'Your scan is waiting to be processed.',
      icon: Clock3,
      color: 'text-blue-600 dark:text-blue-400',
      background: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-900/40',
      dot: 'bg-blue-500',
    },
    processing: {
      label: mode === 'crawl' ? 'Crawling pages' : 'Processing scan',
      description: 'Analyzing your website for accessibility issues.',
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      background: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-900/40',
      dot: 'bg-blue-500',
    },
    scanning: {
      label: 'Scanning website',
      description: 'Checking accessibility rules and affected elements.',
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      background: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-200 dark:border-orange-900/40',
      dot: 'bg-orange-500',
    },
    completed: {
      label: mode === 'crawl' ? 'Crawl completed' : 'Scan completed',
      description: mode === 'crawl' ? stage : 'Your accessibility audit has finished successfully.',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      background: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-900/40',
      dot: 'bg-emerald-500',
    },
    failed: {
      label: mode === 'crawl' ? 'Crawl failed' : 'Scan failed',
      description: error || 'The scan could not be completed.',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      background: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-900/40',
      dot: 'bg-red-500',
    },
    demo: {
      label: 'Sample audit loaded',
      description:
        'Results below are representative demo data, not findings from your URL.',
      icon: Info,
      color: 'text-orange-600 dark:text-orange-400',
      background: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-200 dark:border-orange-900/40',
      dot: 'bg-orange-500',
    },
  };

  const config = statusConfig[state] || {
    label: state
      ? state.charAt(0).toUpperCase() + state.slice(1)
      : 'Ready',
    description: 'Scan status is provided by your API.',
    icon: Activity,
    color: 'text-zinc-600 dark:text-zinc-400',
    background: 'bg-zinc-100 dark:bg-zinc-800',
    border: 'border-zinc-200 dark:border-zinc-700',
    dot: 'bg-zinc-400',
  };

  const Icon = config.icon;

  return (
    <div className="w-full bg-white dark:bg-zinc-900">
      {state !== 'idle' && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-7"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.background} ${config.border} ${config.color}`}
          >
            {pending ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <Icon size={19} strokeWidth={1.9} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
                {config.label}
              </h3>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${config.background} ${config.border} ${config.color}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${config.dot} ${
                    pending ? 'animate-pulse' : ''
                  }`}
                />

                {pending
                  ? 'In progress'
                  : failed
                  ? 'Failed'
                  : completed
                  ? 'Complete'
                  : isDemo
                  ? 'Demo'
                  : state}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {pending && stage ? `${stage.replaceAll('-', ' ')} · ${progress}%` : config.description}
            </p>
          </div>

          {pending && (
            <div className="flex shrink-0 items-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              Working...
            </div>
          )}

          {completed && (
            <CheckCircle2
              size={20}
              className="hidden shrink-0 text-emerald-500 sm:block"
            />
          )}
        </div>
      )}

      {pending && (
        <div className="h-[3px] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-orange-500 transition-[width] duration-500" style={{ width: `${Math.max(2, Math.min(95, progress))}%` }} />
        </div>
      )}

      {error && !failed && (
        <div
          role="status"
          className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-900/40 dark:bg-amber-500/10 sm:mx-7"
        >
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <p className="text-[11px] leading-[1.8] text-amber-800 dark:text-amber-300">
            {error}
          </p>
        </div>
      )}

      {error && failed && state === 'idle' && (
        <div
          role="alert"
          className="mx-5 my-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-900/40 dark:bg-red-500/10 sm:mx-7"
        >
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />
          <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
