import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { ShareMenu } from '../components/people/ShareMenu';
import { BookCard } from '../components/author/BookCard';
import { EmptyState } from '../components/ui/EmptyState';
import { fetchAuthorBooks } from '../lib/api';
import { AUTHOR_ADMIN_PATH, AUTHOR_NAME, AUTHOR_PAGE_PATH, DEFAULT_AUTHOR_SHORT_BIO } from '../lib/constants';
import { siteUrl } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import type { AuthorBook } from '../types';

export function AuthorPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<AuthorBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAuthorBooks()
      .then((nextBooks) => {
        if (active) setBooks(nextBooks);
      })
      .catch(() => {
        if (active) setBooks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [books, loading]);

  const pageUrl = `${siteUrl()}${AUTHOR_PAGE_PATH}`;
  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${AUTHOR_NAME} kitapları`,
        url: pageUrl,
        itemListElement: books.map((book, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Book',
            name: book.title,
            datePublished: book.year ? String(book.year) : undefined,
            description: book.description || undefined,
            image: book.cover_url || undefined,
            author: { '@type': 'Person', name: AUTHOR_NAME },
          },
        })),
      },
    ],
    [books, pageUrl]
  );

  return (
    <>
      <Seo
        title="Kitaplarım"
        description={`${AUTHOR_NAME}'in kitapları. ${DEFAULT_AUTHOR_SHORT_BIO}`}
        path={AUTHOR_PAGE_PATH}
        jsonLd={jsonLd}
      />

      <section className="bg-ink-900 text-cream-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cream-300">İsmail Hayal</p>
            <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl">Kitaplarım</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-200 sm:text-lg">
              Gümüşhane'nin insan hafızasını, kültürünü ve eğitimini kayıt altına alan eserler.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to={AUTHOR_ADMIN_PATH} className="text-sm text-cream-200 underline underline-offset-4">
                Düzenle
              </Link>
            ) : null}
            <ShareMenu title="Kitaplarım" url={pageUrl} className="border-cream-400 text-cream-50 hover:bg-ink-800" />
          </div>
        </div>
      </section>

      <section className="bg-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          {loading ? (
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="mx-auto aspect-[2/3] w-full max-w-[15rem] animate-pulse bg-cream-200" />
              ))}
            </ul>
          ) : books.length === 0 ? (
            <EmptyState
              title="Henüz kitap eklenmedi."
              description="Yeni çıkan kitaplar yönetim panelinden buraya eklenebilir."
            />
          ) : (
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <li key={book.id} id={`kitap-${book.slug}`} className="scroll-mt-28">
                  <BookCard book={book} to={`${AUTHOR_PAGE_PATH}#kitap-${book.slug}`} size="lg" />
                  {book.description ? (
                    <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-ink-600">
                      {book.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
