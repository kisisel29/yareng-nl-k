import type { Category } from '../../types';
import { cn } from '../../lib/cn';

interface FilterBarProps {
  categories: Category[];
  categorySlug: string;
  sortAlpha: boolean;
  onCategoryChange: (slug: string) => void;
  onSortChange: (alpha: boolean) => void;
}

export function FilterBar({
  categories,
  categorySlug,
  sortAlpha,
  onCategoryChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3 overflow-x-auto pb-1">
        <select
          value={categorySlug}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="min-w-[12rem] rounded-md border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-800 focus:border-burgundy-700 focus:outline-none"
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => onSortChange(!sortAlpha)}
        className={cn(
          'self-start rounded-md border px-3 py-2 text-sm',
          sortAlpha
            ? 'border-burgundy-700 bg-burgundy-700 text-cream-50'
            : 'border-cream-300 bg-white text-ink-700'
        )}
      >
        A–Z sıralama
      </button>
    </div>
  );
}
