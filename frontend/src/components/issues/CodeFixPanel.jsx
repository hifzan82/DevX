
import {
  Code2,
  Copy,
  Eye,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  FileCode2,
} from 'lucide-react';

export default function CodeFixPanel({
  issue,
  onInspect,
  onCopy,
  onAction,
  onIgnore,
}) {
  const isVerified = issue.status === 'Verified';
  const isIgnored = issue.status === 'Ignored';

  const actions = [
    {
      label: 'Generate fix',
      icon: Plus,
      onClick: () =>
        onAction?.(
          'Fix generation requires the backend fixes API. The sample suggestion is shown above.'
        ),
    },
    {
      label: 'Copy fix',
      icon: Copy,
      onClick: onCopy,
    },
    {
      label: 'Preview',
      icon: Eye,
      onClick: () =>
        onAction?.(
          'Preview fixes in a controlled sandbox when backend verification is available.'
        ),
    },
    {
      label: 'Verify',
      icon: ShieldCheck,
      onClick: () =>
        onAction?.(
          'Verification is unavailable without the backend verification endpoint.'
        ),
    },
  ];

  return (
    <div className="space-y-5 border-t border-zinc-100 bg-white px-4 py-5 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <p className="text-[12px] leading-[1.85] text-zinc-600 dark:text-zinc-400">
          {issue.explanation}
        </p>
      </div>

      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-3 transition-colors duration-200 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-zinc-600">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <Code2 size={16} />
        </div>

        <code className="min-w-0 flex-1 truncate font-mono text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
          {issue.selector}
        </code>

        <button
          type="button"
          onClick={onInspect}
          aria-label="Select affected element"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[11px] font-bold text-zinc-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
        >
          <Eye size={14} />
          Inspect
        </button>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <FileCode2
            size={15}
            className="text-zinc-400 dark:text-zinc-500"
          />

          <h3 className="text-[10px] font-bold uppercase tracking-[0.09em] text-zinc-500 dark:text-zinc-400">
            Affected element
          </h3>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/70 dark:border-zinc-700 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between border-b border-zinc-200/70 px-3.5 py-2.5 dark:border-zinc-800">
            <span className="flex items-center gap-2 font-mono text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              Current implementation
            </span>

            <span className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[9px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              HTML
            </span>
          </div>

          <pre className="max-h-[220px] overflow-auto p-4 font-mono text-[11px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
            <code className="whitespace-pre-wrap break-words">
              {issue.snippet}
            </code>
          </pre>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <Sparkles size={14} />
            </div>

            <h3 className="text-[10px] font-bold uppercase tracking-[0.09em] text-zinc-700 dark:text-zinc-300">
              Suggested fix
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${
              isVerified
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400'
                : isIgnored
                ? 'border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-500/10 dark:text-orange-400'
            }`}
          >
            {isVerified ? (
              <CheckCircle2 size={12} />
            ) : (
              <AlertCircle size={12} />
            )}
            {issue.status}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-orange-200/80 bg-orange-50/30 dark:border-orange-900/40 dark:bg-orange-950/10">
          <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50/70 px-3.5 py-2.5 dark:border-orange-900/30 dark:bg-orange-500/5">
            <span className="flex items-center gap-2 font-mono text-[10px] font-medium text-orange-700 dark:text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Proposed improvement
            </span>

            <span className="rounded-md border border-orange-200 bg-white px-2 py-0.5 font-mono text-[9px] text-orange-600 dark:border-orange-900/50 dark:bg-zinc-900 dark:text-orange-400">
              FIX
            </span>
          </div>

          <pre className="max-h-[240px] overflow-auto p-4 font-mono text-[11px] leading-[1.8] text-zinc-800 dark:text-zinc-200">
            <code className="whitespace-pre-wrap break-words">
              {issue.fix}
            </code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="group inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-zinc-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md active:scale-[0.97] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            <Icon
              size={15}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
          Review suggested changes before applying them.
        </p>

        <button
          type="button"
          onClick={onIgnore}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-all duration-200 ${
            isIgnored
              ? 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10'
              : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          {isIgnored && <RotateCcw size={13} />}
          {isIgnored ? 'Restore issue' : 'Ignore issue'}
        </button>
      </div>
    </div>
  );
}
