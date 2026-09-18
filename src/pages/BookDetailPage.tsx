import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { BookCard } from '../components/author/BookCard';
import { BookCover } from '../components/author/BookCover';
import { ShareMenu } from '../components/people/ShareMenu';
import { fetchAuthorBookBySlug, fetchAuthorBooks } from '../lib/api';
import { AUTHOR_ADMIN_PATH, AUTHOR_NAME, AUTHOR_PAGE_PATH } from '../lib/constants';
import { hasText, siteUrl } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import type { AuthorBook } from '../types';
import { NotFoundPage } from './NotFoundPage';

export function BookDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState<AuthorBook | null>(null);
  const [related, setRelated] = useState<AuthorBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setMissing(false);
    fetchAuthorBookBySlug(slug)
      .then((result) => {
        if (!active) return;
        setBook(result);
        setMissing(!result);
        if (result) {
          fetchAuthorBooks()
            .then((books) => {
              if (active) setRelated(books.filter((item) => item.id !== result.id).slice(0, 4));
            })
            .catch(() => {
              if (active) setRelated([]);
            });
        } else {
          setRelated([]);
        }
      })
      .catch(() => {
        if (!active) return;
        setMissing(true);
        setBook(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const path = book ? `${AUTHOR_PAGE_PATH}/${book.slug}` : AUTHOR_PAGE_PATH;
  const pageUrl = `${siteUrl()}${path}`;
  const meta = [book?.year, book?.publisher].filter(Boolean).join(' · ');

  const jsonLd = useMemo(() => {
    if (!book) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      description: book.description || undefined,
      image: book.cover_url || undefined,
      datePublished: book.year ? String(book.year) : undefined,
      publisher: book.publisher || undefined,
      author: { '@type': 'Person', name: AUTHOR_NAME },
      url: pageUrl,
    };
  }, [book, pageUrl]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-ink-500">Yükleniyor…</div>;
  }
  if (missing || !book) {
    return <NotFoundPage message="Bu kitap sayfada bulunamadı." />;
  }

  return (
    <>
      <Seo
        title={book.title}
        description={book.description || `${AUTHOR_NAME} kitabı: ${book.title}`}
        path={path}
        image={book.cover_url}
        jsonLd={jsonLd}
      />
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm text-ink-500">
          <Link to={AUTHOR_PAGE_PATH} className="hover:text-ink-900">
            Kitaplarım
          </Link>
          <span className="px-2">/</span>
          <span>{book.title}</span>
        </p>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(14rem,18rem)_1fr]">
          <div className="mx-auto w-full max-w-[18rem] overflow-hidden border border-cream-200/70 shadow-book-rest">
            <div className="aspect-[2/3]">
              <BookCover book={book} />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">{AUTHOR_NAME}</p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-serif text-4xl text-ink-900 sm:text-5xl">{book.title}</h1>
                {meta ? <p className="mt-3 text-lg text-ink-500">{meta}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {user ? (
                  <Link to={AUTHOR_ADMIN_PATH} className="text-sm text-burgundy-700 hover:underline">
                    Düzenle
                  </Link>
                ) : null}
                <ShareMenu title={book.title} url={pageUrl} />
              </div>
            </div>

            {hasText(book.description) ? (
              <p className="prose-archive mt-8 whitespace-pre-line">{book.description}</p>
            ) : (
              <p className="mt-8 text-ink-600">Bu kitabın tanıtım metni henüz eklenmedi.</p>
            )}
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-cream-200 pt-10">
            <h2 className="font-serif text-2xl text-ink-900">Diğer kitaplar</h2>
            <ul className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <BookCard book={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </>
  );
}
