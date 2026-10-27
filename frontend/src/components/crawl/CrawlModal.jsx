
import { AlertTriangle, Layers3, Play, X, Globe2, ArrowRight, Info } from 'lucide-react';

export default function CrawlModal({
  open,
  url,
  onUrlChange,
  onClose,
  onStart
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-[5px] animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="relative w-full max-w-[520px] overflow-hidden rounded-[22px] border border-zinc-200/80 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 slide-in-from-bottom-3 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crawl-title"
      >
        <div className="flex items-start justify-between px-7 pb-5 pt-7 sm:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/40 dark:text-orange-400">
            <Layers3 size={23} strokeWidth={1.8} />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-zinc-400 transition-all duration-200 hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 active:scale-95 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-7 pb-7 sm:px-8">
          <div className="mb-7">
            <h2
              id="crawl-title"
              className="text-[25px] font-extrabold tracking-[-0.8px] text-zinc-900 dark:text-zinc-100"
            >
              Scan all pages
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-zinc-500 dark:text-zinc-400">
              Configure your crawl settings to analyze accessibility
              across multiple pages of your website.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="crawl-url"
                className="mb-2.5 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
              >
                Starting URL
              </label>

              <div className="group flex h-[50px] items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 transition-all duration-200 hover:border-zinc-300 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800/60 dark:focus-within:bg-zinc-800">
                <Globe2
                  size={18}
                  className="shrink-0 text-zinc-400 transition-colors group-focus-within:text-orange-500"
                />

                <input
                  id="crawl-url"
                  type="url"
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="https://example.com"
                  autoComplete="url"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-zinc-800 outline-none placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-0 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="crawl-max-pages"
                  className="mb-2.5 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
                >
                  Maximum pages
                </label>

                <input
                  id="crawl-max-pages"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue="20"
                  className="h-[49px] w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 text-[13px] font-semibold text-zinc-800 outline-none transition-all duration-200 hover:border-zinc-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100"
                />

                <p className="mt-2 text-[11px] text-zinc-400">
                  Up to 100 pages per crawl
                </p>
              </div>

              <div>
                <label
                  htmlFor="crawl-max-depth"
                  className="mb-2.5 block text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
                >
                  Maximum depth
                </label>

                <input
                  id="crawl-max-depth"
                  type="number"
                  min="0"
                  max="10"
                  defaultValue="3"
                  className="h-[49px] w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 text-[13px] font-semibold text-zinc-800 outline-none transition-all duration-200 hover:border-zinc-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100"
                />

                <p className="mt-2 text-[11px] text-zinc-400">
                  Maximum link-following depth
                </p>
              </div>
            </div>

            <label className="group flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-4 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-600 shadow-sm dark:bg-zinc-700 dark:text-zinc-300">
                  <Globe2 size={17} />
                </div>

                <div>
                  <span className="block text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
                    Stay on starting domain
                  </span>

                  <span className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-400">
                    Restrict scanning to the same website
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded-md border-zinc-300 accent-orange-600 focus:ring-orange-500 dark:border-zinc-600"
              />
            </label>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <div className="min-w-0">
                <div className="text-[12px] font-bold text-amber-900 dark:text-amber-300">
                  Backend integration required
                </div>

                <p className="mt-1.5 text-[11px] leading-[1.7] text-amber-800/80 dark:text-amber-200/70">
                  Multi-page crawling requires the{' '}
                  <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-[10px] dark:bg-amber-900/40">
                    POST /api/crawls
                  </code>{' '}
                  endpoint, which is not currently available.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/70 px-7 py-5 sm:flex-row sm:px-8 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[45px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-[12px] font-bold text-zinc-600 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-md active:scale-[0.98] sm:w-auto dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onStart}
            className="group flex h-[45px] w-full items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-6 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_8px_22px_rgba(0,0,0,0.2)] active:scale-[0.98] sm:w-auto dark:bg-orange-600 dark:hover:bg-orange-500"
          >
            <Play size={15} fill="currentColor" />
            Start crawl
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>
      </section>
    </div>
  );
}
