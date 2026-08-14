import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import type { Category } from '../../types';

export function CategoryChips({
  categories,
  activeSlug = '',
  onSelect,
  asLinks = false,
}: {
  categories: Category[];
  activeSlug?: string;
  onSelect?: (slug: string) => void;
  asLinks?: boolean;
}) {
  const items = [{ id: 'all', name: 'Tümü', slug: '' }, ...categories];

  return (
    <div className="-mx-4 flex gap-x-4 gap-y-2 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {items.map((item) => {
        const active = activeSlug === item.slug;
        const className = cn(
          'shrink-0 whitespace-nowrap border-b pb-1',
          active ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-600 hover:text-ink-900'
        );

        if (asLinks) {
          return (
            <Link key={item.id} to={item.slug ? `/simalar?kategori=${item.slug}` : '/simalar'} className={className}>
              {item.name}
            </Link>
          );
        }

        return (
          <button key={item.id} type="button" className={className} onClick={() => onSelect?.(item.slug)}>
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
