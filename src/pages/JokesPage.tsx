import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { EmptyState } from '../components/ui/EmptyState';
import { fetchJokes } from '../lib/api';
import { JOKES_ADMIN_PATH, JOKES_PAGE_PATH } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import type { Joke } from '../types';

export function JokesPage() {
  const { user } = useAuth();
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchJokes()
      .then((list) => {
        if (active) setJokes(list);
      })
      .catch(() => {
        if (active) setJokes([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Seo
        title="Gümüşhane Fıkraları"
        description="Gümüşhane'ye özgü fıkralar ve güldürüleri."
        path={JOKES_PAGE_PATH}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Güldürü</p>
            <h1 className="mt-2 font-serif text-4xl text-ink-900">Gümüşhane Fıkraları</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600">
              Gümüşhane&apos;nin dilinden, mizahından ve insanından izler taşıyan fıkralar.
            </p>
          </div>
          {user ? (
            <Link to={JOKES_ADMIN_PATH} className="shrink-0 text-sm text-burgundy-700 hover:underline">
              Düzenle
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-10 text-sm text-ink-500">Yükleniyor…</div>
        ) : jokes.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Henüz fıkra eklenmedi."
              description="Yeni fıkralar yönetim panelinden eklenebilir."
            />
          </div>
        ) : (
          <ul className="mt-10 space-y-8">
            {jokes.map((joke, index) => (
              <li key={joke.id} className="border-t border-cream-200 pt-6">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-500">Fıkra {jokes.length - index}</p>
                <h2 className="mt-2 font-serif text-2xl text-ink-900">{joke.title}</h2>
                <pre className="mt-4 whitespace-pre-wrap font-serif text-lg leading-[1.9] text-ink-800">
                  {joke.body}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
