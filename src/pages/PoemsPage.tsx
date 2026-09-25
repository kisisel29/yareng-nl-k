import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { fetchPoemBySlug, fetchPoems } from '../lib/api';
import { POEMS_ADMIN_PATH, POEMS_PAGE_PATH } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/cn';
import type { Poem } from '../types';

export function PoemsPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [current, setCurrent] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Şiir</p>
            <h1 className="mt-2 font-serif text-4xl text-ink-900">Şiirler</h1>
          </div>
          {user ? (
            <Link to={POEMS_ADMIN_PATH} className="text-sm text-burgundy-700 hover:underline">
              Düzenle
            </Link>
          ) : null}
        </div>

        {poems.length > 1 ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {poems.map((poem) => {
              const active = current?.id === poem.id;
              return (
                <li key={poem.id}>
                  <Link
                    to={`${POEMS_PAGE_PATH}/${poem.slug}`}
                    className={cn(
                      'inline-block border px-3 py-1.5 text-sm',
                      active
                        ? 'border-ink-900 bg-ink-900 text-white'
                        : 'border-cream-300 text-ink-700 hover:border-ink-900'
                    )}
                  >
                    {poem.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}

        {loading ? (
          <div className="mt-10 text-sm text-ink-500">Yükleniyor…</div>
        ) : (
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(16rem,20rem)_1fr]">
            <div className="aspect-[3/4] border border-cream-200/70">
              {current?.image_url ? (
                <img src={current.image_url} alt={current.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center text-ink-500">
                  <span className="text-sm">Fotoğraf / resim</span>
                  <span className="text-xs">Bu alana şiir görseli eklenebilir.</span>
                </div>
              )}
            </div>
            <div className="min-h-[24rem] px-1 py-2 sm:px-2">
              {current ? (
                <>
                  <h2 className="font-serif text-3xl text-ink-900">{current.title}</h2>
                  <p className="mt-2 text-sm text-ink-500">{current.poet}</p>
                  <pre className="mt-8 whitespace-pre-wrap font-serif text-lg leading-[2] text-ink-800">
                    {current.body || 'Şiir metni henüz eklenmedi.'}
                  </pre>
                </>
              ) : (
                <div className="flex h-full min-h-[20rem] flex-col justify-center text-ink-500">
                  <p className="font-serif text-2xl text-ink-800">Şiir alanı</p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed">
                    Şiirler yönetim panelinden eklendiğinde metin burada görünür.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
