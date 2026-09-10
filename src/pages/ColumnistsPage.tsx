import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { EmptyState } from '../components/ui/EmptyState';
import { ColumnistAvatar } from '../components/columnists/ColumnistAvatar';
import { SocialShareButtons } from '../components/columnists/SocialShareButtons';
import { fetchColumnistArticle, fetchColumnistBySlug, fetchColumnists } from '../lib/api';
import { COLUMNISTS_ADMIN_PATH, COLUMNISTS_PAGE_PATH } from '../lib/constants';
import { formatDateTimeTr, hasText, plainTextExcerpt } from '../lib/format';
import { sanitizeHtml } from '../lib/sanitize';
import { useAuth } from '../context/AuthContext';
import type { Columnist, ColumnistArticle } from '../types';

export function ColumnistsPage() {
  const { slug, articleSlug } = useParams();
  if (slug && articleSlug) return <ArticleView columnistSlug={slug} articleSlug={articleSlug} />;
  if (slug) return <ColumnistView slug={slug} />;
  return <IndexView />;
}

function IndexView() {
  const { user } = useAuth();
  const [columnists, setColumnists] = useState<Columnist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColumnists()
      .then(setColumnists)
      .catch(() => setColumnists([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo
        title="Köşe Yazarları"
        description="Gümüşhaneli Simalar köşe yazarları ve yazıları."
        path={COLUMNISTS_PAGE_PATH}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Köşe</p>
            <h1 className="mt-2 font-serif text-4xl text-ink-900">Yazarları</h1>
          </div>
          {user ? (
            <Link to={COLUMNISTS_ADMIN_PATH} className="text-sm text-burgundy-700 hover:underline">
              Düzenle
            </Link>
          ) : null}
        </div>
        {loading ? (
          <div className="mt-10 h-40 animate-pulse bg-cream-100" />
        ) : columnists.length === 0 ? (
          <EmptyState title="Henüz köşe yazarı eklenmedi." />
        ) : (
          <ul className="mt-10 space-y-8">
            {columnists.map((columnist) => (
              <li key={columnist.id} className="border-t border-cream-200 pt-6">
                <Link to={`${COLUMNISTS_PAGE_PATH}/${columnist.slug}`} className="flex gap-4">
                  <ColumnistAvatar columnist={columnist} />
                  <span>
                    <span className="block font-serif text-2xl text-ink-900">{columnist.name}</span>
                    {columnist.title ? <span className="mt-1 block text-sm text-ink-500">{columnist.title}</span> : null}
                    {columnist.articles[0] ? (
                      <span className="mt-2 block text-sm text-ink-600">{columnist.articles[0].title}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function ColumnistView({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [columnist, setColumnist] = useState<Columnist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColumnistBySlug(slug)
      .then(setColumnist)
      .catch(() => setColumnist(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-ink-500">Yükleniyor…</div>;
  }
  if (!columnist) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Köşe yazarı bulunamadı." />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={columnist.name}
        description={columnist.title || `${columnist.name} köşe yazıları.`}
        path={`${COLUMNISTS_PAGE_PATH}/${columnist.slug}`}
        image={columnist.photo_url}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm">
          <Link to={COLUMNISTS_PAGE_PATH} className="text-ink-500 hover:text-ink-900">
            Köşe Yazarları
          </Link>
        </p>
        <div className="mt-6 flex items-start gap-5">
          <ColumnistAvatar columnist={columnist} size="lg" />
          <div>
            <h1 className="font-serif text-4xl text-ink-900">{columnist.name}</h1>
            {columnist.title ? <p className="mt-2 text-ink-600">{columnist.title}</p> : null}
            {user ? (
              <Link to={COLUMNISTS_ADMIN_PATH} className="mt-3 inline-block text-sm text-burgundy-700 hover:underline">
                Düzenle
              </Link>
            ) : null}
          </div>
        </div>
        {columnist.articles.length === 0 ? (
          <p className="mt-10 text-ink-500">Henüz yazı eklenmedi.</p>
        ) : (
          <ul className="mt-10 space-y-5">
            {columnist.articles.map((article) => (
              <li key={article.id} className="border-t border-cream-200 pt-5">
                <Link to={`${COLUMNISTS_PAGE_PATH}/${columnist.slug}/${article.slug}`} className="block hover:opacity-80">
                  <h2 className="font-serif text-2xl text-ink-900">{article.title}</h2>
                  <p className="mt-1 text-sm text-ink-500">{formatDateTimeTr(article.created_at)}</p>
                  {hasText(article.body) ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{plainTextExcerpt(article.body, 180)}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  );
}

function ArticleView({ columnistSlug, articleSlug }: { columnistSlug: string; articleSlug: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<{ columnist: Columnist; article: ColumnistArticle } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColumnistArticle(columnistSlug, articleSlug)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [articleSlug, columnistSlug]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-ink-500">Yükleniyor…</div>;
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Yazı bulunamadı." />
      </div>
    );
  }

  const { columnist, article } = data;
  const path = `${COLUMNISTS_PAGE_PATH}/${columnist.slug}/${article.slug}`;

  return (
    <>
      <Seo
        title={article.title}
        description={plainTextExcerpt(article.body, 160) || `${columnist.name} köşe yazısı.`}
        path={path}
        image={columnist.photo_url}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm text-ink-500">
          <Link to={COLUMNISTS_PAGE_PATH} className="hover:text-ink-900">
            Köşe Yazarları
          </Link>
          <span className="px-2">/</span>
          <Link to={`${COLUMNISTS_PAGE_PATH}/${columnist.slug}`} className="hover:text-ink-900">
            {columnist.name}
          </Link>
        </p>
        <h1 className="mt-6 font-serif text-4xl text-ink-900">{article.title}</h1>
        <div className="mt-5 flex items-center gap-3">
          <Link to={`${COLUMNISTS_PAGE_PATH}/${columnist.slug}`} className="flex items-center gap-2">
            <ColumnistAvatar columnist={columnist} size="sm" />
            <span className="text-sm font-medium text-ink-800">{columnist.name}</span>
          </Link>
          <span className="text-sm text-ink-500">{formatDateTimeTr(article.created_at)}</span>
          {user ? (
            <Link to={COLUMNISTS_ADMIN_PATH} className="ml-auto text-sm text-burgundy-700 hover:underline">
              Düzenle
            </Link>
          ) : null}
        </div>
        {hasText(article.body) ? (
          <div
            className="prose-archive mt-10"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.body) }}
          />
        ) : null}
        <div className="mt-10">
          <SocialShareButtons url={path} title={article.title} />
        </div>
      </article>
    </>
  );
}
