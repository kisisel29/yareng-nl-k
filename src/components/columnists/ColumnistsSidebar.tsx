import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchColumnists } from '../../lib/api';
import { COLUMNISTS_PAGE_PATH } from '../../lib/constants';
import { ColumnistAvatar } from './ColumnistAvatar';
import { ColumnNameLabel } from './ColumnNameLabel';
import type { Columnist } from '../../types';

const PAGE_SIZE = 5;

function latestArticleAt(columnist: Columnist): string {
  return columnist.articles[0]?.created_at || columnist.updated_at || columnist.created_at || '';
}

function byLatestWriting(a: Columnist, b: Columnist): number {
  return latestArticleAt(b).localeCompare(latestArticleAt(a));
}

export function ColumnistsSidebar({ variant = 'vertical' }: { variant?: 'vertical' | 'horizontal' }) {
  const [columnists, setColumnists] = useState<Columnist[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchColumnists()
      .then((list) => setColumnists([...list].sort(byLatestWriting)))
      .catch(() => setColumnists([]));
  }, []);

  const pageCount = Math.max(1, Math.ceil(columnists.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return columnists.slice(start, start + PAGE_SIZE);
  }, [columnists, safePage]);

  if (columnists.length === 0 && variant === 'horizontal') return null;

  if (variant === 'horizontal') {
    return (
      <div className="border-b border-cream-200 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Köşe Yazarları</p>
          <Link to={COLUMNISTS_PAGE_PATH} className="text-xs text-burgundy-700 hover:underline">
            Tümü
          </Link>
        </div>
        <ul className="flex gap-4 overflow-x-auto pb-1">
          {columnists.slice(0, PAGE_SIZE).map((columnist) => (
            <li key={columnist.id} className="shrink-0">
              <Link to={columnistHref(columnist)} className="flex w-20 flex-col items-center gap-1">
                <ColumnistAvatar columnist={columnist} size="sm" />
                <span className="line-clamp-2 text-center text-[11px] leading-tight text-ink-700">{columnist.name}</span>
                {columnist.column_name ? (
                  <ColumnNameLabel
                    name={columnist.column_name}
                    size="sm"
                    className="mt-0 text-center"
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        {columnists.length > PAGE_SIZE ? (
          <p className="mt-2 text-center text-[11px] text-ink-500">
            <Link to={COLUMNISTS_PAGE_PATH} className="text-burgundy-700 hover:underline">
              Diğer yazarlar
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-end justify-between border-b border-cream-200 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Köşe</p>
          <h2 className="mt-1 font-serif text-xl text-ink-900">Yazarları</h2>
        </div>
        <Link to={COLUMNISTS_PAGE_PATH} className="text-xs text-burgundy-700 hover:underline">
          Tümü
        </Link>
      </div>
      <ul className="mt-4 space-y-4">
        {columnists.length === 0 ? (
          <li className="text-sm leading-relaxed text-ink-500">
            Köşe yazarları eklendikçe küçük fotoğrafları ve yazıları burada görünür.
          </li>
        ) : (
          pageItems.map((columnist) => {
            const latest = columnist.articles[0];
            return (
              <li key={columnist.id}>
                <Link to={columnistHref(columnist)} className="flex gap-3 hover:opacity-80">
                  <ColumnistAvatar columnist={columnist} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink-900">{columnist.name}</span>
                    {columnist.column_name ? (
                      <ColumnNameLabel name={columnist.column_name} size="sm" className="mt-0.5 block" />
                    ) : null}
                    {latest ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-ink-500">{latest.title}</span>
                    ) : columnist.title ? (
                      <span className="mt-0.5 block text-xs text-ink-500">{columnist.title}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
      {pageCount > 1 ? (
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-1.5" aria-label="Köşe yazarları sayfaları">
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setPage(number)}
              className={
                number === safePage
                  ? 'min-w-[1.75rem] bg-ink-900 px-2 py-1 text-xs font-medium text-cream-50'
                  : 'min-w-[1.75rem] px-2 py-1 text-xs text-ink-600 hover:bg-cream-100'
              }
              aria-current={number === safePage ? 'page' : undefined}
            >
              {number}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function columnistHref(columnist: Columnist): string {
  const latest = columnist.articles[0];
  if (latest) return `${COLUMNISTS_PAGE_PATH}/${columnist.slug}/${latest.slug}`;
  return `${COLUMNISTS_PAGE_PATH}/${columnist.slug}`;
}
