import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchColumnists } from '../../lib/api';
import { COLUMNISTS_PAGE_PATH } from '../../lib/constants';
import { ColumnistAvatar } from './ColumnistAvatar';
import type { Columnist } from '../../types';

export function ColumnistsSidebar({ variant = 'vertical' }: { variant?: 'vertical' | 'horizontal' }) {
  const [columnists, setColumnists] = useState<Columnist[]>([]);

  useEffect(() => {
    fetchColumnists()
      .then(setColumnists)
      .catch(() => setColumnists([]));
  }, []);

  if (columnists.length === 0 && variant === 'horizontal') return null;

  if (variant === 'horizontal') {
    return (
      <div className="border-b border-cream-200 bg-cream-50 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Köşe Yazarları</p>
          <Link to={COLUMNISTS_PAGE_PATH} className="text-xs text-burgundy-700 hover:underline">
            Tümü
          </Link>
        </div>
        <ul className="flex gap-4 overflow-x-auto pb-1">
          {columnists.map((columnist) => (
            <li key={columnist.id} className="shrink-0">
              <Link to={`${COLUMNISTS_PAGE_PATH}/${columnist.slug}`} className="flex w-16 flex-col items-center gap-1">
                <ColumnistAvatar columnist={columnist} size="sm" />
                <span className="line-clamp-2 text-center text-[11px] leading-tight text-ink-700">{columnist.name}</span>
              </Link>
            </li>
          ))}
        </ul>
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
          columnists.map((columnist) => {
            const latest = columnist.articles[0];
            return (
              <li key={columnist.id}>
                <Link to={`${COLUMNISTS_PAGE_PATH}/${columnist.slug}`} className="flex gap-3 hover:opacity-80">
                  <ColumnistAvatar columnist={columnist} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink-900">{columnist.name}</span>
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
    </div>
  );
}
