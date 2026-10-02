import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { Seo } from '../components/seo/Seo';
import { EmptyState } from '../components/ui/EmptyState';
import { ContentEngagement } from '../components/engagement/ContentEngagement';
import { fetchJokes } from '../lib/api';
import { JOKES_ADMIN_PATH, JOKES_PAGE_PATH } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { btnSecondary, cn } from '../lib/cn';
import type { Joke } from '../types';

function pickRandomJoke(list: Joke[], exceptId?: string): Joke | null {
  if (list.length === 0) return null;
  const pool = exceptId && list.length > 1 ? list.filter((item) => item.id !== exceptId) : list;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

function jokeFromHash(list: Joke[]): Joke | null {
  const hash = window.location.hash.replace(/^#/, '').trim();
  if (!hash) return null;
  return list.find((item) => item.slug === hash) ?? null;
}

export function JokesPage() {
  const { user } = useAuth();
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [current, setCurrent] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(true);
  const readerRef = useRef<HTMLElement | null>(null);
  const didInit = useRef(false);

  useEffect(() => {
    let active = true;
    fetchJokes()
      .then((list) => {
        if (!active) return;
        setJokes(list);
        if (!didInit.current) {
          didInit.current = true;
          const fromHash = jokeFromHash(list);
          const next = fromHash ?? pickRandomJoke(list);
          setCurrent(next);
          if (next && !fromHash) {
            window.history.replaceState(null, '', `${JOKES_PAGE_PATH}#${next.slug}`);
          }
        }
      })
      .catch(() => {
        if (!active) return;
        setJokes([]);
        setCurrent(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onHashChange() {
      setCurrent((prev) => {
        const fromHash = jokeFromHash(jokes);
        return fromHash ?? prev;
      });
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [jokes]);

  const currentIndex = useMemo(
    () => (current ? jokes.findIndex((item) => item.id === current.id) : -1),
    [jokes, current]
  );

  function selectJoke(joke: Joke, options?: { scroll?: boolean }) {
    setCurrent(joke);
    window.history.replaceState(null, '', `${JOKES_PAGE_PATH}#${joke.slug}`);
    if (options?.scroll === false) return;
    const narrow = window.matchMedia('(max-width: 1023px)').matches;
    if (narrow && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function showRandom() {
    const next = pickRandomJoke(jokes, current?.id);
    if (next) selectJoke(next);
  }

  const sharePath = current ? `${JOKES_PAGE_PATH}#${current.slug}` : JOKES_PAGE_PATH;
  const seoDescription = current
    ? `${current.title} — Gümüşhane fıkrası.`
    : "Gümüşhane'ye özgü fıkralar ve güldürüleri.";

  return (
    <>
      <Seo
        title={current ? `${current.title} · Gümüşhane Fıkraları` : 'Gümüşhane Fıkraları'}
        description={seoDescription}
        path={sharePath}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Güldürü</p>
            <h1 className="mt-1 font-serif text-3xl text-ink-900 sm:text-4xl">Gümüşhane Fıkraları</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
              Her açılışta rastgele bir fıkra; listeden istediğinizi seçebilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {jokes.length > 1 ? (
              <button type="button" className={btnSecondary} onClick={showRandom}>
                <Shuffle className="h-4 w-4" />
                Rastgele fıkra
              </button>
            ) : null}
            {user ? (
              <Link to={JOKES_ADMIN_PATH} className="text-sm text-burgundy-700 hover:underline">
                Düzenle
              </Link>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 text-sm text-ink-500">Yükleniyor…</div>
        ) : jokes.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Henüz fıkra eklenmedi."
              description="Yeni fıkralar yönetim panelinden eklenebilir."
            />
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)] lg:gap-8">
            <aside className="lg:sticky lg:top-24">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-500">
                Fıkralar ({jokes.length})
              </p>
              <nav
                className="max-h-[min(40vh,18rem)] overflow-y-auto border border-cream-200 bg-white/80 lg:max-h-[calc(100vh-10rem)]"
                aria-label="Fıkra listesi"
              >
                <ul className="divide-y divide-cream-100">
                  {jokes.map((joke, index) => {
                    const active = current?.id === joke.id;
                    return (
                      <li key={joke.id}>
                        <button
                          type="button"
                          onClick={() => selectJoke(joke)}
                          className={cn(
                            'flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm leading-snug transition',
                            active ? 'bg-ink-900 text-white' : 'text-ink-800 hover:bg-cream-100'
                          )}
                          aria-current={active ? 'true' : undefined}
                        >
                          <span
                            className={cn(
                              'mt-0.5 shrink-0 text-[10px] tabular-nums',
                              active ? 'text-cream-300' : 'text-ink-500'
                            )}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 font-medium">{joke.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <article ref={readerRef} className="min-w-0 scroll-mt-24 border border-cream-200 bg-white/70 p-5 sm:p-7">
              {current ? (
                <>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-500">
                    Fıkra {currentIndex >= 0 ? currentIndex + 1 : '—'} / {jokes.length}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-ink-900 sm:text-4xl">{current.title}</h2>
                  {current.image_url ? (
                    <div className="mt-5 overflow-hidden border border-cream-200/70">
                      <img
                        src={current.image_url}
                        alt=""
                        className="mx-auto h-auto max-h-[22rem] w-full object-contain object-center"
                      />
                    </div>
                  ) : null}
                  <pre className="mt-5 whitespace-pre-wrap font-serif text-lg leading-[1.9] text-ink-800 sm:text-xl sm:leading-[1.95]">
                    {current.body}
                  </pre>
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-cream-200 pt-4">
                    <button
                      type="button"
                      className={btnSecondary}
                      disabled={currentIndex <= 0}
                      onClick={() => {
                        const prev = jokes[currentIndex - 1];
                        if (prev) selectJoke(prev);
                      }}
                    >
                      Önceki
                    </button>
                    <button
                      type="button"
                      className={btnSecondary}
                      disabled={currentIndex < 0 || currentIndex >= jokes.length - 1}
                      onClick={() => {
                        const next = jokes[currentIndex + 1];
                        if (next) selectJoke(next);
                      }}
                    >
                      Sonraki
                    </button>
                    {jokes.length > 1 ? (
                      <button type="button" className={btnSecondary} onClick={showRandom}>
                        <Shuffle className="h-4 w-4" />
                        Rastgele
                      </button>
                    ) : null}
                  </div>
                  <ContentEngagement
                    url={sharePath}
                    title={current.title}
                    targetKey={`joke:${current.id}`}
                  />
                </>
              ) : (
                <p className="text-sm text-ink-500">Bir fıkra seçin.</p>
              )}
            </article>
          </div>
        )}
      </div>
    </>
  );
}
