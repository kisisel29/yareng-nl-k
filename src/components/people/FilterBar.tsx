import type { Category } from '../../types';
import { cn } from '../../lib/cn';
import { CategoryChips } from './CategoryChips';

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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <CategoryChips categories={categories} activeSlug={categorySlug} onSelect={onCategoryChange} />
      <button
        type="button"
        onClick={() => onSortChange(!sortAlpha)}
        className={cn(
          'shrink-0 self-start text-sm',
          sortAlpha ? 'text-ink-900 underline' : 'text-ink-600 hover:text-ink-900'
        )}
      >
        A–Z
      </button>
    </div>
  );
}
