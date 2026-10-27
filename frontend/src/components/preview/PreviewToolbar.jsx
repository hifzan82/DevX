
import {
  ExternalLink,
  Globe2,
  RefreshCw,
  Monitor,
  Smartphone,
  Eye,
  LockKeyhole,
} from 'lucide-react';

export default function PreviewToolbar({
  url,
  demo,
  viewport = 'desktop',
  active,
  onRefresh,
  onViewportChange,
}) {
  const changeViewport = (next) => {
    onViewportChange?.(next === viewport ? 'desktop' : next);
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400">
              <Eye size={19} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[16px] font-extrabold tracking-[-0.5px] text-zinc-900 dark:text-zinc-100">
                  Live preview
                </h2>

                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[9px] font-bold tracking-[0.025em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      demo ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                  />
                  {demo ? 'DEMO PAGE' : 'CONTROLLED PREVIEW'}
                </span>
              </div>

              <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <Globe2 size={13} className="shrink-0" />
                <span className="max-w-[230px] truncate sm:max-w-[320px]">
                  {url || 'https://sample-page.design'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Refresh preview"
            title="Refresh preview"
            onClick={onRefresh}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            <RefreshCw
              size={16}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
          </button>

          <div
            className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-700"
            aria-hidden="true"
          />

          <div
            className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800"
            role="group"
            aria-label="Preview viewport"
          >
            <button
              type="button"
              aria-label="Desktop viewport"
              title="Desktop viewport"
              aria-pressed={viewport === 'desktop'}
              onClick={() => changeViewport('desktop')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
                viewport === 'desktop'
                  ? 'bg-white text-orange-600 shadow-sm dark:bg-zinc-700 dark:text-orange-400'
                  : 'text-zinc-400 hover:bg-white/80 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Monitor size={16} />
            </button>

            <button
              type="button"
              aria-label="Mobile viewport"
              title="Mobile viewport"
              aria-pressed={viewport === 'mobile'}
              onClick={() => changeViewport('mobile')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
                viewport === 'mobile'
                  ? 'bg-white text-orange-600 shadow-sm dark:bg-zinc-700 dark:text-orange-400'
                  : 'text-zinc-400 hover:bg-white/80 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone size={16} />
            </button>
          </div>

          <button
            type="button"
            aria-label="Open preview in new window"
            title="Open preview in new window"
            onClick={() => window.open('about:blank', '_blank', 'noopener')}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="flex min-h-[43px] items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/70 px-5 py-2.5 sm:px-6 dark:border-zinc-800 dark:bg-zinc-800/40">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              active ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          />

          <span className="truncate text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            {active
              ? `${active.count} affected ${
                  active.count === 1 ? 'element' : 'elements'
                } selected`
              : 'Select an issue to inspect elements'}
          </span>
        </div>

        <span className="shrink-0 rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          {viewport}
        </span>
      </div>
    </>
  );
}
