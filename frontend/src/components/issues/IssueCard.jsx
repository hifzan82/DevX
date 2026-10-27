
import { ChevronRight, AlertCircle, Layers3 } from 'lucide-react';
import CodeFixPanelEnhanced from './CodeFixPanelEnhanced.jsx';

export default function IssueCard({
  issue,
  index,
  selected,
  expanded,
  websiteCategory = 'General',
  onSelect,
  onInspect,
  onCopy,
  onIgnore,
  onAction,
}) {
  const isIgnored = issue.status === 'Ignored';

  const severityStyles = {
    critical: {
      dot: 'bg-red-500',
      badge:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400',
    },
    serious: {
      dot: 'bg-orange-500',
      badge:
        'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-500/10 dark:text-orange-400',
    },
    moderate: {
      dot: 'bg-amber-500',
      badge:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400',
    },
    minor: {
      dot: 'bg-blue-500',
      badge:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-500/10 dark:text-blue-400',
    },
  };

  const severity = severityStyles[issue.severity] || {
    dot: 'bg-zinc-400',
    badge:
      'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-300 ease-out dark:bg-zinc-900 ${
        selected
          ? 'border-orange-300 shadow-[0_0_0_1px_rgba(234,120,75,0.12),0_6px_22px_rgba(0,0,0,0.055)] dark:border-orange-700 dark:shadow-[0_0_0_1px_rgba(234,120,75,0.12),0_6px_22px_rgba(0,0,0,0.2)]'
          : 'border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.025)] hover:border-zinc-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]'
      } ${isIgnored ? 'opacity-65' : ''}`}
    >
      {selected && (
        <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-orange-500" />
      )}

      <button
        type="button"
        onClick={onSelect}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-3 px-4 py-[17px] text-left transition-colors duration-200 sm:gap-3.5 sm:px-5 ${
          selected
            ? 'bg-orange-50/40 dark:bg-orange-500/5'
            : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
        }`}
      >
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${severity.dot} shadow-sm`}
        />

        <span className="hidden w-6 shrink-0 font-mono text-[11px] font-medium text-zinc-400 sm:inline">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[12px] font-bold leading-relaxed tracking-[-0.1px] text-zinc-900 dark:text-zinc-100 sm:text-[13px]">
            {issue.title}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
            <code className="max-w-[150px] truncate rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {issue.rule}
            </code>

            <span className="h-[3px] w-[3px] rounded-full bg-zinc-300 dark:bg-zinc-600" />

            <span className="whitespace-nowrap">
              WCAG {issue.wcag}
            </span>
          </div>
        </div>

        <span
          className={`hidden shrink-0 items-center rounded-lg border px-2.5 py-1.5 text-[10px] font-bold capitalize sm:inline-flex ${severity.badge}`}
        >
          {issue.severity}
        </span>

        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1.5 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <Layers3 size={12} className="text-zinc-400" />
          {issue.count}
          <span className="hidden text-[10px] font-normal text-zinc-500 lg:inline">
            nodes
          </span>
        </span>

        <ChevronRight
          size={17}
          className={`shrink-0 text-zinc-400 transition-transform duration-300 ${
            expanded
              ? 'rotate-90 text-orange-500'
              : 'group-hover:translate-x-0.5'
          }`}
        />
      </button>

      <div className="border-t border-zinc-100 px-4 py-2 sm:hidden dark:border-zinc-800">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-bold capitalize ${severity.badge}`}
        >
          {issue.severity}
        </span>
      </div>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <CodeFixPanelEnhanced
            issue={issue}
            websiteCategory={websiteCategory}
            onInspect={onInspect}
            onCopy={onCopy}
            onAction={onAction}
            onIgnore={onIgnore}
            onToast={onAction}
          />
        </div>
      )}
    </article>
  );
}
