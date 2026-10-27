
import {
  Check,
  GitPullRequest,
  ShieldCheck,
  X,
  FileCode2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  GitBranch,
} from 'lucide-react';

export default function PullRequestReview({
  repository,
  patches = [],
  onApprove,
  onReject,
  onCreate,
  loading = false,
}) {
  const approvedCount = patches.filter((patch) => patch.approved).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_4px_20px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 border-b border-zinc-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400">
            <GitPullRequest size={21} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Review proposed changes
            </h2>

            <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <GitBranch size={13} className="shrink-0" />
              <span className="truncate">
                {repository || 'Choose an authorized repository first'}
              </span>
            </div>
          </div>
        </div>

        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 size={14} />
          {approvedCount} APPROVED
        </span>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {patches.length > 0 ? (
          <div className="space-y-3">
            {patches.map((patch) => (
              <article
                key={patch.id}
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_5px_18px_rgba(0,0,0,0.045)] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:shadow-black/20"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      <FileCode2 size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-all font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {patch.filePath}
                      </p>

                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {patch.summary}
                      </p>

                      {patch.approved && (
                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <CheckCircle2 size={12} />
                          Approved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                    <button
                      type="button"
                      aria-label={`Approve patch ${patch.filePath}`}
                      title="Approve patch"
                      aria-pressed={Boolean(patch.approved)}
                      onClick={() => onApprove?.(patch.id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                        patch.approved
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400'
                      }`}
                    >
                      <Check size={17} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Reject patch ${patch.filePath}`}
                      title="Reject patch"
                      onClick={() => onReject?.(patch.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-red-800 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Proposed diff
                    </span>

                    <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                      DIFF
                    </span>
                  </div>

                  <pre className="max-h-[280px] overflow-auto rounded-lg border border-zinc-200 bg-white p-4 font-mono text-[11px] leading-6 text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    <code>{patch.diff}</code>
                  </pre>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
              <GitPullRequest size={28} strokeWidth={1.5} />
            </div>

            <h3 className="mt-5 text-base font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
              No proposed patches
            </h3>

            <p className="mt-2 max-w-[320px] text-xs leading-6 text-zinc-500 dark:text-zinc-400">
              Accessibility fixes proposed for your repository will
              appear here for review and approval.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              <Clock3 size={13} />
              Awaiting proposed changes
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-5 sm:px-6 dark:border-zinc-800 dark:bg-zinc-800/20">
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5 dark:border-emerald-900/30 dark:bg-emerald-500/5">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
          />

          <div>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Approval required
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-700/80 dark:text-emerald-400/80">
              Only individually approved patches can be submitted for
              pull request creation.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {approvedCount}
            </span>{' '}
            of{' '}
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {patches.length}
            </span>{' '}
            patches approved
          </div>

          <button
            type="button"
            disabled={loading || approvedCount === 0}
            onClick={onCreate}
            className="group inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto dark:bg-orange-600 dark:hover:bg-orange-500"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <GitPullRequest size={16} />
            )}

            {loading ? 'Creating pull request...' : 'Create pull request'}
          </button>
        </div>
      </div>
    </section>
  );
}
