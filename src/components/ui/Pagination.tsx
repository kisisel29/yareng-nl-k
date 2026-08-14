import { cn } from '../../lib/cn';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const pages = visiblePages(page, pageCount);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Sayfalama">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={pageBtn(false)}
      >
        Önceki
      </button>
      {pages.map((item, index) =>
        item === '…' ? (
          <span key={`e-${index}`} className="px-2 text-ink-500">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={pageBtn(item === page)}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className={pageBtn(false)}
      >
        Sonraki
      </button>
    </nav>
  );
}

function pageBtn(active: boolean) {
  return cn(
    'rounded-md border px-3 py-2 text-sm disabled:opacity-40',
    active ? 'border-burgundy-700 bg-burgundy-700 text-cream-50' : 'border-cream-300 bg-white text-ink-700'
  );
}

function visiblePages(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | '…'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('…');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < total - 1) items.push('…');
  items.push(total);
  return items;
}
