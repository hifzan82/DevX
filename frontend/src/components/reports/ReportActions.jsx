
import {
  ArrowDownUp,
  ArrowUpRight,
  FileDown,
  Github,
  Workflow,
} from 'lucide-react';

export default function ReportActions({
  onExport,
  onCompare,
  onPullRequest,
}) {
  const actions = [
    {
      title: 'Export report',
      description: 'Download findings as CSV',
      icon: FileDown,
      onClick: onExport,
      iconStyle:
        'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/40',
    },
    {
      title: 'Compare scans',
      description: 'Track changes over time',
      icon: ArrowDownUp,
      onClick: onCompare,
      iconStyle:
        'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-900/40',
    },
    {
      title: 'Review fixes & create PR',
      description: 'Review changes before sharing',
      icon: Github,
      onClick: onPullRequest,
      iconStyle:
        'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/40',
    },
  ];

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.035),0_14px_35px_rgba(0,0,0,0.035)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_5px_25px_rgba(0,0,0,0.18)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400">
            <Workflow size={21} strokeWidth={1.9} />
          </div>

          <div>
            <h2 className="text-[18px] font-extrabold tracking-[-0.5px] text-zinc-900 dark:text-zinc-100">
              Next steps
            </h2>

            <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Turn your audit findings into actionable improvements.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          WORKFLOW
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              onClick={action.onClick}
              className="group flex min-w-0 items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.025)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-[0_8px_25px_rgba(0,0,0,0.075)] active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-orange-800/60 dark:hover:bg-zinc-800 dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] sm:p-5"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${action.iconStyle}`}
              >
                <Icon size={21} strokeWidth={1.9} />
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block text-[13px] font-bold tracking-[-0.2px] text-zinc-900 dark:text-zinc-100">
                  {action.title}
                </strong>

                <span className="mt-1.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {action.description}
                </span>
              </span>

              <ArrowUpRight
                size={17}
                className="shrink-0 text-zinc-400 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-orange-600 dark:text-zinc-500 dark:group-hover:text-orange-400"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
