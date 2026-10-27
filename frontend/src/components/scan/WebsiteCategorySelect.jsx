
import { ChevronDown, Layers3 } from 'lucide-react';

export const WEBSITE_CATEGORIES = [
  'General',
  'Fintech',
  'Gaming',
  'E-commerce',
  'Education',
  'Healthcare',
  'Government',
];

export default function WebsiteCategorySelect({
  value = 'General',
  onChange,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="accesslens-category"
        className="block text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
      >
        Website category
      </label>

      <div className="relative">
        <Layers3
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <select
          id="accesslens-category"
          value={value}
          onChange={event => onChange?.(event.target.value)}
          disabled={disabled}
          className="h-[49px] w-full appearance-none rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-11 text-[13px] font-medium text-zinc-800 shadow-sm outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {WEBSITE_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />
      </div>

      <p className="text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
        Personalizes remediation examples without changing audit results.
      </p>
    </div>
  );
}
