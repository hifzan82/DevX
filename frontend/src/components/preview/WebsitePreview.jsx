
import PreviewToolbar from './PreviewToolbar.jsx';
import IssueHighlight from './IssueHighlight.jsx';

export default function WebsitePreview({
  className = '',
  iframeRef,
  srcDoc,
  demo,
  screenshot,
  url,
  selector,
  active,
  viewport = 'desktop',
  onViewportChange,
  onRefresh,
}) {
  const isMobile = viewport === 'mobile';

  return (
    <section
      className={`flex h-[650px] min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.035),0_14px_35px_rgba(0,0,0,0.035)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_5px_25px_rgba(0,0,0,0.18)] sm:h-[680px] ${className}`}
      aria-label="Website preview"
    >
      {demo && <IssueHighlight frameRef={iframeRef} selector={selector} />}

      <div className="shrink-0">
        <PreviewToolbar
          url={url}
          demo={demo}
          active={active}
          viewport={viewport}
          onViewportChange={onViewportChange}
          onRefresh={onRefresh}
          screenshot={screenshot}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100/80 dark:bg-zinc-950/70">
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-6">
          <div
            className={`flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.09),0_20px_48px_rgba(0,0,0,0.04)] transition-[width,box-shadow,border-color] duration-300 ease-in-out dark:border-zinc-700 dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] ${
              isMobile
                ? 'w-[320px] max-w-full'
                : 'w-full'
            }`}
          >
            <div className="flex h-10 shrink-0 items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="h-[9px] w-[9px] rounded-full bg-red-400" />
                <span className="h-[9px] w-[9px] rounded-full bg-amber-400" />
                <span className="h-[9px] w-[9px] rounded-full bg-emerald-400" />
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
                <span className="truncate text-center font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  {url || 'sample-page.design'}
                </span>
              </div>
            </div>

            {demo ? (
              <iframe title="Sample website preview" ref={iframeRef} srcDoc={srcDoc} sandbox="allow-same-origin" data-selected-selector={selector || ''} className="block h-full min-h-0 w-full flex-1 border-0 bg-white" />
            ) : screenshot ? (
              <div className="min-h-0 flex-1 overflow-auto bg-white">
                <div className="relative w-full">
                  <img src={screenshot} alt={`Captured preview of ${url}`} className="block h-auto w-full" />
                  {active?.bounds && active.bounds.x >= 0 && active.bounds.y >= 0 && active.bounds.y < 900 && active.bounds.width > 0 && (
                    <div aria-label={`Selected element for ${active.rule}`} className="pointer-events-none absolute rounded border-[3px] border-orange-500 bg-orange-500/15 shadow-[0_0_0_4px_rgba(249,115,22,0.18)]" style={{ left: `${active.bounds.x / 1280 * 100}%`, top: `${active.bounds.y / 900 * 100}%`, width: `${active.bounds.width / 1280 * 100}%`, height: `${active.bounds.height / 900 * 100}%` }} />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">A captured preview will appear after the scan completes.</div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-200 bg-white px-4 py-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="inline-flex items-center gap-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-orange-500" />
            Selected element
          </span>

          <span className="inline-flex items-center gap-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-[3px] border border-zinc-400 bg-transparent dark:border-zinc-500" />
            Other findings
          </span>

          <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500">
            {demo ? 'Controlled sample · not the target site' : screenshot ? 'Screenshot from scan · non-interactive' : 'Preview pending'}
          </span>
        </div>
      </div>
    </section>
  );
}
