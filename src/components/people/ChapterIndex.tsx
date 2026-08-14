import { Link } from 'react-router-dom';
import type { Category } from '../../types';

export function ChapterIndex({ categories }: { categories: Category[] }) {
  return (
    <ol className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => (
        <li key={category.id}>
          <Link
            to={`/simalar?kategori=${category.slug}`}
            className="flex items-baseline gap-3 py-1.5 text-ink-800 hover:text-burgundy-700"
          >
            <span className="w-7 shrink-0 text-xs text-ink-500">{String(index + 1).padStart(2, '0')}</span>
            <span className="border-b border-transparent hover:border-ink-900">{category.name}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
