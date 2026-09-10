import { Link } from 'react-router-dom';
import { BookCover } from './BookCover';
import { AUTHOR_PAGE_PATH } from '../../lib/constants';
import { cn } from '../../lib/cn';
import type { AuthorBook } from '../../types';

export function BookCard({
  book,
  to,
  variant = 'light',
  size = 'md',
}: {
  book: AuthorBook;
  to?: string;
  variant?: 'light' | 'dark';
  size?: 'md' | 'lg';
}) {
  const href = to ?? `${AUTHOR_PAGE_PATH}#kitap-${book.slug}`;
  const dark = variant === 'dark';

  return (
    <Link
      to={href}
      className={cn('group block focus:outline-none', dark ? 'text-cream-50' : 'text-ink-900')}
    >
      <div
        className={cn(
          'relative mx-auto aspect-[2/3] overflow-hidden bg-cream-100 transition duration-300 group-hover:-translate-y-2 group-hover:shadow-book',
          size === 'lg' ? 'max-w-[14rem]' : 'max-w-[11rem]',
          'shadow-book-rest'
        )}
      >
        <BookCover book={book} />
      </div>
      <h3
        className={cn(
          'mt-4 text-center font-serif leading-snug',
          size === 'lg' ? 'text-2xl' : 'text-xl',
          dark ? 'text-cream-50' : 'text-ink-900'
        )}
      >
        {book.title}
      </h3>
      <p className={cn('mt-1 text-center text-sm', dark ? 'text-cream-300' : 'text-ink-500')}>
        {[book.year, book.publisher].filter(Boolean).join(' · ') || 'İsmail Hayal'}
      </p>
    </Link>
  );
}
