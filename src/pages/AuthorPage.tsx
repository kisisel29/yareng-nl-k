import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { ShareMenu } from '../components/people/ShareMenu';
import { BookCover } from '../components/author/BookCover';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionTitle } from '../components/brand/SectionTitle';
import { fetchAuthorBooks, fetchAuthorProfile } from '../lib/api';
import {
  AUTHOR_NAME,
  AUTHOR_PAGE_PATH,
  DEFAULT_AUTHOR_BIOGRAPHY,
  DEFAULT_AUTHOR_SHORT_BIO,
  DEFAULT_AUTHOR_TITLE,
  SOCIAL_LINKS,
} from '../lib/constants';
import { formatDateTr, hasText, siteUrl } from '../lib/format';
import { sanitizeHtml } from '../lib/sanitize';
import { useAuth } from '../context/AuthContext';
import { SocialLinks } from '../components/layout/SocialLinks';
import type { AuthorBook, AuthorProfile } from '../types';

function fallbackProfile(): AuthorProfile {
  return {
    id: 1,
    full_name: AUTHOR_NAME,
    title: DEFAULT_AUTHOR_TITLE,
    short_bio: DEFAULT_AUTHOR_SHORT_BIO,
    biography: DEFAULT_AUTHOR_BIOGRAPHY,
    birth_date: '1969-05-23',
    birth_place: 'Gümüşhane',
    photo_url: null,
    photo_path: null,
  };
}

export function AuthorPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AuthorProfile>(fallbackProfile);
  const [books, setBooks] = useState<AuthorBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchAuthorProfile(), fetchAuthorBooks()])
      .then(([nextProfile, nextBooks]) => {
        if (!active) return;
        if (nextProfile) setProfile(nextProfile);
        setBooks(nextBooks);
      })
      .catch(() => {
        if (!active) return;
        setProfile(fallbackProfile());
        setBooks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pageUrl = `${siteUrl()}${AUTHOR_PAGE_PATH}`;
  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.full_name,
        url: pageUrl,
        jobTitle: profile.title || DEFAULT_AUTHOR_TITLE,
        description: profile.short_bio || DEFAULT_AUTHOR_SHORT_BIO,
        image: profile.photo_url || undefined,
        birthDate: profile.birth_date || undefined,
        birthPlace: profile.birth_place || undefined,
        sameAs: SOCIAL_LINKS.map((link) => link.href),
      },
      ...(books.length
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: `${profile.full_name} kitapları`,
              itemListElement: books.map((book, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Book',
                  name: book.title,
                  datePublished: book.year ? String(book.year) : undefined,
                  description: book.description || undefined,
                  image: book.cover_url || undefined,
                  author: { '@type': 'Person', name: profile.full_name },
                },
              })),
            },
          ]
        : []),
    ],
    [books, pageUrl, profile]
  );

  return (
    <>
      <Seo
        title={profile.full_name}
        description={profile.short_bio || DEFAULT_AUTHOR_SHORT_BIO}
        path={AUTHOR_PAGE_PATH}
        image={profile.photo_url}
        jsonLd={jsonLd}
      />
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-ink-500">Yazar</p>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/admin/ismail-hayal" className="text-sm text-burgundy-700 hover:underline">
                Düzenle
              </Link>
            ) : null}
            <ShareMenu title={profile.full_name} url={pageUrl} />
          </div>
        </div>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[16rem_1fr]">
          <div className="bg-cream-100">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center font-serif text-5xl text-ink-500">
                İH
              </div>
            )}
          </div>
          <div>
            <h1 className="font-serif text-4xl text-ink-900 sm:text-5xl">{profile.full_name}</h1>
            {profile.title ? <p className="mt-3 text-lg text-ink-600">{profile.title}</p> : null}
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {profile.birth_place ? (
                <div className="border-t border-cream-200 pt-3">
                  <dt className="text-xs uppercase tracking-wider text-ink-500">Doğum yeri</dt>
                  <dd className="mt-1 text-ink-800">{profile.birth_place}</dd>
                </div>
              ) : null}
              {profile.birth_date ? (
                <div className="border-t border-cream-200 pt-3">
                  <dt className="text-xs uppercase tracking-wider text-ink-500">Doğum tarihi</dt>
                  <dd className="mt-1 text-ink-800">{formatDateTr(profile.birth_date)}</dd>
                </div>
              ) : null}
            </dl>
            {profile.short_bio ? (
              <p className="mt-8 max-w-xl leading-relaxed text-ink-700">{profile.short_bio}</p>
            ) : null}
            <SocialLinks variant="buttons" className="mt-8" />
          </div>
        </div>

        {loading ? (
          <div className="mt-12 h-48 animate-pulse rounded-md bg-cream-100" />
        ) : hasText(profile.biography) ? (
          <section className="mt-14 max-w-3xl">
            <h2 className="font-serif text-3xl text-ink-900">Özgeçmiş</h2>
            <div
              className="prose-archive mt-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.biography) }}
            />
          </section>
        ) : null}

        <section className="mt-16">
          <SectionTitle eyebrow="Eserler" title="Kitapları" />
          {!loading && books.length === 0 ? (
            <EmptyState
              title="Henüz kitap eklenmedi."
              description="Yeni çıkan kitaplar yönetim panelinden buraya eklenebilir."
            />
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {(loading ? [] : books).map((book) => (
                <li key={book.id} className="border border-cream-200 bg-white">
                  <div className="aspect-[2/3] bg-cream-100">
                    <BookCover book={book} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-xl text-ink-900">{book.title}</h3>
                    <p className="mt-1 text-sm text-ink-500">
                      {[book.year, book.publisher].filter(Boolean).join(' · ')}
                    </p>
                    {book.description ? (
                      <p className="mt-3 text-sm leading-relaxed text-ink-600">{book.description}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </>
  );
}
