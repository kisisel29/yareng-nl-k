import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { fetchPoemBySlug, fetchPoems } from '../lib/api';
import { AUTHOR_NAME, POEMS_ADMIN_PATH, POEMS_PAGE_PATH } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/cn';
import type { Poem } from '../types';

function groupPoemsByPoet(poems: Poem[]): { poet: string; poems: Poem[] }[] {
  const byPoet = new Map<string, Poem[]>();
  for (const poem of poems) {
    const poet = poem.poet.trim() || AUTHOR_NAME;
    const list = byPoet.get(poet) ?? [];
    list.push(poem);
    byPoet.set(poet, list);
  }

  return [...byPoet.entries()]
    .map(([poet, items]) => ({ poet, poems: items }))
    .sort((a, b) => {
      if (a.poet === AUTHOR_NAME && b.poet !== AUTHOR_NAME) return -1;
      if (b.poet === AUTHOR_NAME && a.poet !== AUTHOR_NAME) return 1;
      return a.poet.localeCompare(b.poet, 'tr');
    });
}

export function PoemsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [current, setCurrent] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePoet, setActivePoet] = useState<string | null>(null);
  const readerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;
    const load = slug ? fetchPoemBySlug(slug) : fetchPoems().then((list) => list[0] ?? null);
    Promise.all([fetchPoems(), load])
      .then(([list, poem]) => {
        if (!active) return;
        setPoems(list);
        setCurrent(poem);
      })
      .catch(() => {
        if (!active) return;
        setPoems([]);
        setCurrent(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const poetGroups = useMemo(() => groupPoemsByPoet(poems), [poems]);

  useEffect(() => {
    if (current?.poet) {
      setActivePoet(current.poet);
      return;
    }
    if (!activePoet && poetGroups[0]) setActivePoet(poetGroups[0].poet);
  }, [current, poetGroups, activePoet]);

  useEffect(() => {
    if (!slug || loading || !current) return;
    const narrow = window.matchMedia('(max-width: 1023px)').matches;
    if (!narrow || !readerRef.current) return;
    readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [slug, loading, current]);

  const selectedPoet = activePoet || poetGroups[0]?.poet || AUTHOR_NAME;
  const poemsForPoet = useMemo(
    () => poetGroups.find((group) => group.poet === selectedPoet)?.poems ?? [],
    [poetGroups, selectedPoet]
  );

  function selectPoet(poet: string) {
    setActivePoet(poet);
    const group = poetGroups.find((item) => item.poet === poet);
    const first = group?.poems[0];
    if (!first) return;
    if (current?.poet === poet) return;
    navigate(`${POEMS_PAGE_PATH}/${first.slug}`);
  }

  const path = current ? `${POEMS_PAGE_PATH}/${current.slug}` : POEMS_PAGE_PATH;
  const seoDescription = current
    ? `${current.title} — ${current.poet}.`
    : 'İsmail Hayal ve diğer şairlerden seçilmiş şiirler.';

  return (
    <>
      <Seo
        title={current ? current.title : 'Şiirler'}
        description={seoDescription}
        path={path}
        image={current?.image_url}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Şiir</p>
            <h1 className="mt-1 font-serif text-3xl text-ink-900 sm:text-4xl">Şiirler</h1>
          </div>
          {user ? (
            <Link to={POEMS_ADMIN_PATH} className="text-sm text-burgundy-700 hover:underline">
              Düzenle
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-8 text-sm text-ink-500">Yükleniyor…</div>
        ) : poems.length === 0 ? (
          <div className="mt-10 text-ink-500">
            <p className="font-serif text-2xl text-ink-800">Şiir alanı</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed">
              Şiirler yönetim panelinden eklendiğinde burada görünür.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:gap-10">
            <aside className="lg:sticky lg:top-24">
              {poetGroups.length > 1 ? (
                <div className="mb-3 flex flex-col gap-1.5" role="tablist" aria-label="Şairler">
                  {poetGroups.map((group) => {
                    const selected = group.poet === selectedPoet;
                    return (
                      <button
                        key={group.poet}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => selectPoet(group.poet)}
                        className={cn(
                          'flex w-full items-baseline justify-between gap-3 border px-3 py-2 text-left text-sm transition',
                          selected
                            ? 'border-ink-900 bg-ink-900 text-white'
                            : 'border-cream-300 bg-white/80 text-ink-800 hover:border-ink-900'
                        )}
                      >
                        <span className="min-w-0 font-medium leading-snug">{group.poet}</span>
                        <span className={cn('shrink-0 text-xs', selected ? 'text-cream-200' : 'text-ink-500')}>
                          {group.poems.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mb-3 font-serif text-lg text-ink-900">{selectedPoet}</p>
              )}

              <nav
                className="max-h-[min(50vh,22rem)] overflow-y-auto overflow-x-hidden border border-cream-200 bg-white/80 lg:max-h-[calc(100vh-10rem)]"
                aria-label="Şiir listesi"
              >
                <ul className="divide-y divide-cream-100">
                  {poemsForPoet.map((poem) => {
                    const active = current?.id === poem.id;
                    return (
                      <li key={poem.id}>
                        <Link
                          to={`${POEMS_PAGE_PATH}/${poem.slug}`}
                          className={cn(
                            'block px-3 py-2.5 text-sm leading-snug transition',
                            active
                              ? 'bg-ink-900 text-white'
                              : 'text-ink-800 hover:bg-cream-100'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          {poem.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <article ref={readerRef} className="min-w-0 scroll-mt-24">
              {current ? (
                <div className="grid items-start gap-6 md:grid-cols-[minmax(10rem,14rem)_1fr] md:gap-8">
                  <div className="aspect-[3/4] w-full max-w-[14rem] border border-cream-200/70 md:max-w-none">
                    {current.image_url ? (
                      <img
                        src={current.image_url}
                        alt={current.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-ink-500">
                        <span className="text-sm">Fotoğraf / resim</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-serif text-3xl text-ink-900">{current.title}</h2>
                    <p className="mt-2 text-base text-ink-700">{current.poet}</p>
                    <pre className="mt-6 whitespace-pre-wrap font-serif text-lg leading-[2] text-ink-800">
                      {current.body || 'Şiir metni henüz eklenmedi.'}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-500">Bir şiir seçin.</p>
              )}
            </article>
          </div>
        )}
      </div>
    </>
  );
}
