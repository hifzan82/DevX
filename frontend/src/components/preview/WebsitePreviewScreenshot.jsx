
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageOff, ScanSearch } from 'lucide-react';
import PreviewToolbar from './PreviewToolbar.jsx';

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 375, height: 812 },
};

function getIssueBounds(issue, viewport) {
  const stored =
    issue?.previewBounds?.[viewport] ??
    (viewport === 'mobile' ? issue?.boundsMobile : issue?.boundsDesktop) ??
    (viewport === 'desktop' ? issue?.bounds : null);

  const items = Array.isArray(stored) ? stored : stored ? [stored] : [];

  return items.filter(
    (box) =>
      box &&
      [box.x, box.y, box.width, box.height].every(Number.isFinite) &&
      box.width > 0 &&
      box.height > 0
  );
}

export default function WebsitePreviewScreenshot({
  className = '',
  screenshot = '',
  screenshotMobile = '',
  url = '',
  issues = [],
  activeId = '',
  activeIssue,
  onSelectIssue,
  viewport = 'desktop',
  onViewportChange,
  onRefresh,
}) {
  const scrollRef = useRef(null);
  const activeElementRef = useRef(null);
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState(null);
  const [imageError, setImageError] = useState(false);

  const isMobile = viewport === 'mobile';
  const selected = activeIssue || issues.find((issue) => issue.id === activeId);
  const imageSrc = isMobile ? screenshotMobile : screenshot;

  const dimensions = imageSize || VIEWPORTS[viewport];

  const markers = useMemo(
    () =>
      issues.flatMap((issue) =>
        getIssueBounds(issue, viewport).map((bounds, index) => ({
          id: `${issue.id}-${index}`,
          issue,
          bounds,
          index,
          selected: issue.id === activeId,
        }))
      ),
    [issues, viewport, activeId]
  );

  useEffect(() => {
    setImageSize(null);
    setImageError(false);
  }, [imageSrc]);

  useEffect(() => {
    if (!activeId || !activeElementRef.current) return;

    const container = scrollRef.current;
    const target = activeElementRef.current;

    if (!container || !target) return;

    const timer = requestAnimationFrame(() => {
      const containerBounds = container.getBoundingClientRect();
      const targetBounds = target.getBoundingClientRect();

      const offset =
        targetBounds.top -
        containerBounds.top +
        container.scrollTop -
        container.clientHeight / 2 +
        targetBounds.height / 2;

      container.scrollTo({
        top: Math.max(0, offset),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    });

    return () => cancelAnimationFrame(timer);
  }, [activeId, viewport, imageSrc, imageSize]);

  return (
    <section
      className={`flex h-[650px] min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.035),0_14px_35px_rgba(0,0,0,0.035)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_5px_25px_rgba(0,0,0,0.18)] sm:h-[680px] ${className}`}
      aria-label="Website preview"
    >
      <PreviewToolbar
        url={url}
        demo={false}
        screenshot={imageSrc}
        active={selected}
        viewport={viewport}
        onViewportChange={onViewportChange}
        onRefresh={onRefresh}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100/80 dark:bg-zinc-950/70">
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-6">
          <div
            className={`flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.09),0_20px_48px_rgba(0,0,0,0.04)] transition-[width,box-shadow] duration-300 dark:border-zinc-700 dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] ${
              isMobile ? 'w-[320px] max-w-full' : 'w-full'
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
                  {url || 'Website preview'}
                </span>
              </div>
            </div>

            {imageSrc && !imageError ? (
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-auto overscroll-contain bg-white [scrollbar-width:thin]"
              >
                <div className="relative w-full">
                  <img
                    ref={imageRef}
                    key={imageSrc}
                    src={imageSrc}
                    alt={`Non-interactive screenshot of ${url}`}
                    draggable={false}
                    className="block h-auto w-full select-none"
                    onLoad={(event) => {
                      setImageSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      });
                    }}
                    onError={() => setImageError(true)}
                  />

                  {markers.map((marker) => {
                    const { bounds, issue, selected: isSelected } = marker;

                    const left = (bounds.x / dimensions.width) * 100;
                    const top = (bounds.y / dimensions.height) * 100;
                    const width = (bounds.width / dimensions.width) * 100;
                    const height = (bounds.height / dimensions.height) * 100;

                    if (
                      left < 0 ||
                      top < 0 ||
                      left >= 100 ||
                      top >= 100 ||
                      width <= 0 ||
                      height <= 0
                    ) {
                      return null;
                    }

                    return (
                      <button
                        key={marker.id}
                        ref={
                          isSelected && marker.index === 0
                            ? activeElementRef
                            : null
                        }
                        type="button"
                        title={`${issue.title} — ${issue.severity}`}
                        aria-label={`Inspect ${issue.title}, element ${marker.index + 1}`}
                        aria-pressed={isSelected}
                        onClick={() => onSelectIssue?.(issue.id)}
                        className={`absolute z-10 cursor-pointer rounded-[3px] border-[2px] transition-all duration-200 hover:z-30 focus-visible:z-30 focus-visible:outline-2 focus-visible:outline-orange-600 ${
                          isSelected
                            ? 'z-20 border-orange-500 bg-orange-500/20 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]'
                            : 'border-zinc-500 bg-zinc-500/10 hover:border-orange-500 hover:bg-orange-500/20'
                        }`}
                        style={{
                          left: `${Math.max(0, left)}%`,
                          top: `${Math.max(0, top)}%`,
                          width: `${Math.min(width, 100 - Math.max(0, left))}%`,
                          height: `${Math.min(height, 100 - Math.max(0, top))}%`,
                        }}
                      >
                        {isSelected && marker.index === 0 && (
                          <span className="absolute -top-7 left-0 max-w-[210px] truncate whitespace-nowrap rounded-md bg-orange-600 px-2 py-1 text-[10px] font-bold text-white shadow-md">
                            {issue.rule}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                  {imageError ? <ImageOff size={24} /> : <ScanSearch size={24} />}
                </div>

                <h3 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
                  {imageError ? 'Preview unavailable' : 'No screenshot available'}
                </h3>

                <p className="max-w-[270px] text-[11px] leading-6 text-zinc-500 dark:text-zinc-400">
                  {imageError
                    ? 'The captured screenshot could not be displayed.'
                    : 'Scan a public website to capture its preview and inspect accessibility findings.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
          <span className="inline-flex items-center gap-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-orange-500" />
            Selected issue
          </span>

          <span className="inline-flex items-center gap-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-[3px] border border-zinc-500" />
            Other findings
          </span>

          <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500">
            Screenshot preview · non-interactive
          </span>
        </div>
      </div>
    </section>
  );
}
