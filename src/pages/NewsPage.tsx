import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { EmptyState } from '../components/ui/EmptyState';
import { ContentEngagement } from '../components/engagement/ContentEngagement';
import { fetchNews, fetchNewsBySlug } from '../lib/api';
import { NEWS_ADMIN_PATH, NEWS_PAGE_PATH } from '../lib/constants';
import { formatDateTimeTr, hasText, plainTextExcerpt } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import type { NewsItem } from '../types';
import { NotFoundPage } from './NotFoundPage';

export function NewsPage() {
  const { slug } = useParams();
  if (slug) return <NewsDetailView slug={slug} />;
  return <NewsIndexView />;
}

function NewsIndexView() {
  const { user } = useAuth();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo
        title="Haberler"
        description="Gümüşhaneli simalardan güncel haberler ve duyurular."
        path={NEWS_PAGE_PATH}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Gümüşhaneli Simalar</p>
            <h1 className="mt-2 font-serif text-4xl text-ink-900">Haberler</h1>
            <p className="mt-3 max-w-xl text-ink-600">
              Gümüşhaneli simalardan haberler, duyurular ve güncel gelişmeler.
            </p>
          </div>
          {user ? (
            <Link to={NEWS_ADMIN_PATH} className="text-sm text-burgundy-700 hover:underline">
              Düzenle
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-10 text-sm text-ink-500">Yükleniyor…</div>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Henüz haber eklenmedi." description="Yeni haberler yönetim panelinden eklenebilir." />
          </div>
        ) : (
          <ul className="mt-10 space-y-10">
            {items.map((item) => (
              <li key={item.id} className="border-t border-cream-200 pt-8">
                <Link to={`${NEWS_PAGE_PATH}/${item.slug}`} className="group grid gap-5 sm:grid-cols-[12rem_1fr]">
                  <div className="aspect-[4/3] overflow-hidden border border-cream-200/70">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-ink-500">Fotoğraf</div>
                    )}
                  </div>
                  <div>
                    {item.created_at ? (
                      <p className="text-xs uppercase tracking-[0.14em] text-ink-500">{formatDateTimeTr(item.created_at)}</p>
                    ) : null}
                    <h2 className="mt-2 font-serif text-2xl text-ink-900 group-hover:underline">{item.title}</h2>
                    {hasText(item.body) ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">
                        {plainTextExcerpt(item.body, 180)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function NewsDetailView({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchNewsBySlug(slug)
      .then((result) => {
        if (!active) return;
        setItem(result);
        setMissing(!result);
      })
      .catch(() => {
        if (!active) return;
        setMissing(true);
        setItem(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-ink-500">Yükleniyor…</div>;
  }
  if (missing || !item) {
    return <NotFoundPage message="Bu haber bulunamadı." />;
  }

  const path = `${NEWS_PAGE_PATH}/${item.slug}`;

  return (
    <>
      <Seo
        title={item.title}
        description={plainTextExcerpt(item.body, 160) || `${item.title} — Gümüşhaneli Simalar haberi.`}
        path={path}
        image={item.image_url}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm text-ink-500">
          <Link to={NEWS_PAGE_PATH} className="hover:text-ink-900">
            Haberler
          </Link>
          <span className="px-2">/</span>
          <span>{item.title}</span>
        </p>
        {item.created_at ? (
          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-ink-500">{formatDateTimeTr(item.created_at)}</p>
        ) : null}
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-serif text-4xl text-ink-900">{item.title}</h1>
          {user ? (
            <Link to={NEWS_ADMIN_PATH} className="shrink-0 text-sm text-burgundy-700 hover:underline">
              Düzenle
            </Link>
          ) : null}
        </div>
        {item.image_url ? (
          <div className="mt-8 overflow-hidden border border-cream-200/70">
            <img src={item.image_url} alt={item.title} className="h-auto w-full object-cover" />
          </div>
        ) : null}
        {hasText(item.body) ? (
          <div className="prose-archive mt-8 whitespace-pre-line">{item.body}</div>
        ) : null}
        <ContentEngagement url={path} title={item.title} targetKey={`news:${item.id}`} />
      </article>
    </>
  );
}
