import { getCategoryRemediation } from '../../utils/categoryRemediation.js';
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
  Lightbulb,
} from 'lucide-react';

export default function CodeFixPanel({
  issue,
  onInspect,
  onCopy,
  onGenerate,
  onPreview,
  onVerify,
  generating = false,
  onIgnore,
  websiteCategory = 'General',
}) {
  const isVerified = issue.status === 'Verified';
  const isIgnored = issue.status === 'Ignored';

  const actions = [
    {
      label: 'Generate fix',
      icon: Plus,
      onClick: onGenerate,
      disabled: generating,
    },
    {
      label: 'Copy guidance',
      icon: Copy,
      onClick: onCopy,
    },
    {
      label: 'Preview',
      icon: Eye,
      onClick: onPreview,
    },
    {
      label: 'Verify',
      icon: ShieldCheck,
      onClick: onVerify,
    },
  ];

  return (
    <div className="space-y-5 border-t border-zinc-100 bg-white px-4 py-5 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <p className="text-[12px] leading-[1.85] text-zinc-600 dark:text-zinc-400">
          {issue.explanation}
        </p>

        {issue.pageUrl && (
          <p className="mt-2 break-all text-[10px] text-zinc-500 dark:text-zinc-400">
            Page: {issue.pageUrl}
          </p>
        )}

        {issue.helpUrl && (
          <a
            href={issue.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[11px] font-semibold text-orange-600 underline dark:text-orange-400"
          >
            Read rule guidance
          </a>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-800/60">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <Code2 size={16} />
        </div>

        <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
          {issue.selector}
        </code>

        <button
          type="button"
          onClick={onInspect}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[11px] font-bold text-zinc-700 shadow-sm transition-all duration-200 hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <Eye size={14} />
          Inspect
        </button>
      </div>

      <div className="space-y-2.5">
        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-zinc-500 dark:text-zinc-400">
          <FileCode2 size={15} />
          Affected element
        </h3>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/70 dark:border-zinc-700 dark:bg-zinc-950/60">
          <div className="border-b border-zinc-200/70 px-3.5 py-2.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            Current implementation · HTML
          </div>

          <pre className="max-h-[220px] overflow-auto p-4 font-mono text-[11px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
            <code className="whitespace-pre-wrap break-words">
              {issue.snippet}
            </code>
          </pre>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-zinc-700 dark:text-zinc-300">
            <Sparkles size={15} className="text-orange-500" />
            Remediation guidance
          </h3>

          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${
              isVerified
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-500/10 dark:text-orange-400'
            }`}
          >
            {isVerified ? (
              <CheckCircle2 size={12} />
            ) : (
              <AlertCircle size={12} />
            )}
            {issue.status || 'Not tested'}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-orange-200/80 bg-orange-50/30 dark:border-orange-900/40 dark:bg-orange-950/10">
          <div className="border-b border-orange-100 bg-orange-50/70 px-3.5 py-2.5 font-mono text-[10px] text-orange-700 dark:border-orange-900/30 dark:bg-orange-500/5 dark:text-orange-400">
            Suggested change · UNVERIFIED
          </div>

          <pre className="max-h-[240px] overflow-auto p-4 font-mono text-[11px] leading-[1.8] text-zinc-800 dark:text-zinc-200">
            <code className="whitespace-pre-wrap break-words">
              {issue.fix || 'Generate a fix to see a suggestion.'}
            </code>
          </pre>
        </div>

        <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 dark:border-orange-900/30 dark:bg-orange-500/5">
          <div className="flex items-center gap-2">
            <Lightbulb
              size={16}
              className="shrink-0 text-orange-500"
            />

            <h4 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
              {websiteCategory} website example
            </h4>
          </div>

          <p className="mt-2 text-[12px] leading-6 text-zinc-600 dark:text-zinc-400">
            {getCategoryRemediation(issue.rule, websiteCategory)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map(({ label, icon: Icon, onClick, disabled }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="group inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-zinc-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
          Verification checks an isolated element, not the live website.
        </p>

        <button
          type="button"
          onClick={onIgnore}
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-semibold ${
            isIgnored
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {isIgnored && <RotateCcw size={13} />}
          {isIgnored ? 'Restore issue' : 'Ignore issue'}
        </button>
      </div>
    </div>
  );
}