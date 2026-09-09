import { cn } from '../../lib/cn';
import type { AuthorBook } from '../../types';

export function BookCover({
  book,
  className,
}: {
  book: Pick<AuthorBook, 'title' | 'cover_url'>;
  className?: string;
}) {
  if (book.cover_url) {
    return <img src={book.cover_url} alt={book.title} className={cn('h-full w-full object-cover', className)} />;
  }

  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-cream-100 px-3 text-center', className)}>
      <span className="font-serif text-sm leading-snug text-ink-700">{book.title}</span>
    </div>
  );
}
