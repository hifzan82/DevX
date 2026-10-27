
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onChange }) {
  const isDark = theme === 'dark';
  const next = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      aria-pressed={isDark}
      className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 hover:shadow-[0_5px_16px_rgba(0,0,0,0.08)] active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:hover:border-orange-700 dark:hover:bg-zinc-700 dark:hover:text-orange-400"
    >
      <span
        key={theme}
        className="flex items-center justify-center animate-in fade-in zoom-in-75 spin-in-90 duration-300"
      >
        {isDark ? (
          <Sun
            size={19}
            strokeWidth={1.9}
            className="transition-transform duration-300 group-hover:rotate-45"
          />
        ) : (
          <Moon
            size={19}
            strokeWidth={1.9}
            className="transition-transform duration-300 group-hover:-rotate-12"
          />
        )}
      </span>
    </button>
  );
}
