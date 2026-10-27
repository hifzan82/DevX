
import { Filter, ListFilter, ArrowDownUp, ChevronDown } from 'lucide-react';
import IssueSearch from './IssueSearch.jsx';

export default function IssueFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  severity,
  onSeverityChange,
  onSort,
}) {
  const selectStyles =
    'h-10 w-full cursor-pointer appearance-none bg-transparent pl-9 pr-8 text-[11px] font-semibold text-zinc-700 outline-none focus:outline-none dark:text-zinc-300';

  const filterStyles =
    'group relative flex min-w-0 flex-1 items-center rounded-xl border border-zinc-200 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.025)] transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80';

  return (
    <div className="space-y-3 border-b border-zinc-100 bg-white px-4 pb-4 pt-1 dark:border-zinc-800 dark:bg-zinc-900 sm:px-5">
      <IssueSearch
        value={query}
        onChange={onQueryChange}
      />

      <div className="flex items-center gap-2.5">
        <div className={filterStyles}>
          <ListFilter
            size={15}
            className="pointer-events-none absolute left-3 text-zinc-400 transition-colors duration-200 group-focus-within:text-orange-500 dark:text-zinc-500"
          />

          <select
            aria-label="Filter issue status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectStyles}
          >
            <option value="All issues">All issues</option>
            <option value="Open">Open</option>
            <option value="Verified">Verified</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 text-zinc-400 dark:text-zinc-500"
          />
        </div>

        <div className={filterStyles}>
          <Filter
            size={15}
            className="pointer-events-none absolute left-3 text-zinc-400 transition-colors duration-200 group-focus-within:text-orange-500 dark:text-zinc-500"
          />

          <select
            aria-label="Filter severity"
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className={selectStyles}
          >
            <option value="All severities">All severities</option>
            <option value="Critical">Critical</option>
            <option value="Serious">Serious</option>
            <option value="Moderate">Moderate</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 text-zinc-400 dark:text-zinc-500"
          />
        </div>

        <button
          type="button"
          title="Sort by severity"
          aria-label="Sort issues by severity"
          onClick={onSort}
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-[0_2px_6px_rgba(0,0,0,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
        >
          <ArrowDownUp
            size={16}
            className="transition-transform duration-300 group-hover:rotate-180"
          />
        </button>
      </div>
    </div>
  );
}
