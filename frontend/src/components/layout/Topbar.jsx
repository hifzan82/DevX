
import { Activity, Settings2, ChevronDown, Check, Wifi } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

const items = [
  ['workspace', 'Workspace'],
  ['history', 'History'],
  ['monitoring', 'Monitoring'],
  ['github', 'GitHub'],
  ['reports', 'Reports'],
  ['docs', 'Documentation'],
];

export default function Topbar({
  page,
  onNavigate,
  theme,
  onThemeChange,
  demo,
}) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 shadow-[0_2px_15px_rgba(0,0,0,0.025)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-[0_2px_15px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex h-[76px] max-w-[1510px] items-center gap-8 px-5 lg:gap-12 lg:px-10">
        <button
          type="button"
          onClick={() => onNavigate('workspace')}
          aria-label="AccessLens home"
          className="group flex shrink-0 items-center gap-3 rounded-xl text-left transition-opacity duration-200 hover:opacity-90"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 dark:bg-orange-600 dark:shadow-orange-950/20">
            <Activity size={21} strokeWidth={2.2} />
          </span>

          <span className="flex flex-col">
            <span className="font-['Manrope'] text-[20px] font-extrabold leading-none tracking-[-0.9px] text-zinc-900 dark:text-zinc-100">
              access
              <span className="text-orange-500 dark:text-orange-400">
                lens
              </span>
            </span>

            <span className="mt-1.5 font-mono text-[8px] font-medium tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
              WEB ACCESSIBILITY AUDITOR
            </span>
          </span>
        </button>

        <nav
          className="hidden h-full min-w-0 flex-1 items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {items.map(([id, label]) => {
            const active = page === id;

            return (
              <button
                key={id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(id)}
                className={`group relative flex h-full shrink-0 items-center justify-center px-3.5 text-[12px] font-semibold transition-colors duration-200 ${
                  active
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {label}

                <span
                  className={`absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-orange-500 transition-all duration-300 ${
                    active
                      ? 'scale-x-100 opacity-100'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-40'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <div className="relative ml-auto lg:hidden">
          <select
            aria-label="Navigate"
            value={page}
            onChange={(e) => onNavigate(e.target.value)}
            className="h-10 max-w-[125px] cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-3 pr-8 text-[11px] font-semibold text-zinc-700 outline-none transition-all hover:border-zinc-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {[...items, ['settings', 'Settings']].map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold tracking-[0.025em] sm:inline-flex ${
              demo
                ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-500/10 dark:text-orange-400'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400'
            }`}
          >
            <span
              className={`relative flex h-2 w-2 rounded-full ${
                demo ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
            >
              {!demo && (
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />
              )}
            </span>
            {demo ? 'DEMO MODE' : 'LIVE API'}
          </span>

          <ThemeToggle theme={theme} onChange={onThemeChange} />

          <div className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block dark:bg-zinc-700" />

          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={() => onNavigate('settings')}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border text-[13px] font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              page === 'settings'
                ? 'border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-500/10 dark:text-orange-400'
                : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700'
            }`}
          >
            <Settings2
              size={18}
              className="transition-transform duration-300 group-hover:rotate-45"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
