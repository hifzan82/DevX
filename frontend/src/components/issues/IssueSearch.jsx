
import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function IssueSearch({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current.blur();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <div className="group relative w-full">
      <Search
        size={18}
        strokeWidth={1.9}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors duration-200 group-focus-within:text-orange-500 dark:text-zinc-500"
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search issues, rules, or WCAG..."
        aria-label="Search issues"
        className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-16 text-[13px] font-medium text-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.025)] outline-none transition-all duration-200 placeholder:font-normal placeholder:text-zinc-400 hover:border-zinc-300 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-orange-500 dark:focus:ring-orange-500/10 [&::-webkit-search-cancel-button]:hidden"
      />

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            title="Clear search"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 active:scale-95 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        ) : (
          <kbd className="pointer-events-none hidden items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[10px] font-medium text-zinc-400 shadow-sm sm:inline-flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
            ⌘ K
          </kbd>
        )}
      </div>
    </div>
  );
}
