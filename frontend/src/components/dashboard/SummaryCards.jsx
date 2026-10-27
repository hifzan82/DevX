
import {
  AlertTriangle,
  CircleHelp,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export default function SummaryCards({ issues = [], hasResults = false }) {
  const total = issues
    .filter((i) => i.status !== 'Ignored')
    .reduce((n, i) => n + (Number(i.count) || 0), 0);

  const critical = issues
    .filter((i) => i.severity === 'critical' && i.status !== 'Ignored')
    .reduce((n, i) => n + (Number(i.count) || 0), 0);

  const verified = issues
    .filter((i) => i.status === 'Verified')
    .reduce((n, i) => n + (Number(i.count) || 0), 0);

  const score = hasResults
    ? Math.max(
        0,
        100 -
          issues.reduce(
            (n, i) =>
              n +
              (Number(i.count) || 0) *
                ({
                  critical: 12,
                  serious: 7,
                  moderate: 4,
                  minor: 2,
                }[i.severity] || 0),
            0
          )
      )
    : null;

  const cards = [
    {
      label: 'Accessibility Score',
      value: score ?? '—',
      suffix: '/100',
      description:
        score === null
          ? 'Run an audit to calculate'
          : 'Project estimate · automated checks only',
      icon: Activity,
      iconColor: 'text-blue-600',
      iconBackground: 'bg-blue-50 dark:bg-blue-500/10',
      showProgress: true,
    },
    {
      label: 'Total Issues',
      value: hasResults ? total : '—',
      description: hasResults
        ? 'Across all accessibility rules'
        : 'Awaiting first scan',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      iconBackground: 'bg-orange-50 dark:bg-orange-500/10',
    },
    {
      label: 'Critical Issues',
      value: hasResults ? critical : '—',
      description: hasResults
        ? 'Require immediate attention'
        : 'Awaiting first scan',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBackground: 'bg-red-50 dark:bg-red-500/10',
    },
    {
      label: 'Verified Fixes',
      value: hasResults ? verified : '—',
      suffix: hasResults ? `/ ${total}` : '',
      description: 'Verification requires an actual recheck',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      iconBackground: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
  ];

  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5"
      aria-label="Scan summary"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="group relative flex min-h-[188px] flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.035),0_12px_32px_rgba(0,0,0,0.035)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.07),0_20px_45px_rgba(0,0,0,0.04)] sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.09em] text-zinc-500 dark:text-zinc-400">
                  {card.label}
                </span>

                {index === 0 && (
                  <span
                    title="This score is a project-defined estimate, not an official WCAG compliance rating."
                    className="inline-flex cursor-help text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <CircleHelp size={14} />
                  </span>
                )}
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBackground} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={19} strokeWidth={1.9} />
              </div>
            </div>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-[38px] font-extrabold leading-none tracking-[-1.8px] text-zinc-900 tabular-nums dark:text-zinc-100 sm:text-[42px]">
                {card.value}
              </span>

              {card.suffix && (
                <span className="mb-1 text-[13px] font-medium text-zinc-400 dark:text-zinc-500">
                  {card.suffix}
                </span>
              )}

              {card.showProgress && score !== null && (
                <div className="ml-auto flex items-center pb-1">
                  <div
                    className="relative flex h-[43px] w-[43px] items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#ea784b ${score}%, #f0f0ed ${score}% 100%)`,
                    }}
                    aria-label={`Accessibility score ${score} out of 100`}
                  >
                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                      {score}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-5">
              <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {card.description}
              </p>

              {index === 2 && issues.length > 0 && (
                <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-700 ease-out"
                    style={{
                      width: `${total ? (critical / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              )}

              {index === 3 && issues.length > 0 && (
                <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                    style={{
                      width: `${total ? Math.min(100, (verified / total) * 100) : 0}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
