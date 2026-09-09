import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { SocialLinks } from '../components/layout/SocialLinks';
import { SiteLogo } from '../components/brand/SiteLogo';
import { fetchAuthorProfile, fetchSiteSettings } from '../lib/api';
import {
  AUTHOR_ADMIN_PATH,
  AUTHOR_NAME,
  AUTHOR_PAGE_PATH,
  BOOK_SECTIONS,
  DEFAULT_AUTHOR_BIOGRAPHY,
  DEFAULT_AUTHOR_SHORT_BIO,
  DEFAULT_AUTHOR_TITLE,
  DEFAULT_DESCRIPTION,
  SOCIAL_LINKS,
} from '../lib/constants';
import { formatDateTr, hasText, siteUrl } from '../lib/format';
import { sanitizeHtml } from '../lib/sanitize';
import { useAuth } from '../context/AuthContext';
import type { AuthorProfile } from '../types';

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

export function AboutPage() {
  const { user } = useAuth();
  const [intro, setIntro] = useState(DEFAULT_ABOUT);
  const [book, setBook] = useState(DEFAULT_BOOK);
  const [profile, setProfile] = useState<AuthorProfile>(fallbackProfile);

  useEffect(() => {
    Promise.all([fetchSiteSettings(), fetchAuthorProfile()])
      .then(([settings, nextProfile]) => {
        if (settings.about_intro) setIntro(settings.about_intro);
        if (settings.about_book) setBook(settings.about_book);
        if (nextProfile) setProfile({ ...fallbackProfile(), ...nextProfile });
      })
      .catch(() => undefined);
  }, []);

  const biography = hasText(profile.biography) ? profile.biography : DEFAULT_AUTHOR_BIOGRAPHY;

  return (
    <>
      <Seo
        title="Hakkında"
        description="İsmail Hayal'in resmi sitesi. Gümüşhaneli Simalar dijital arşivi ve yazarın özgeçmişi."
        path="/hakkinda"
        image={profile.photo_url}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.full_name,
          url: siteUrl(),
          jobTitle: profile.title || DEFAULT_AUTHOR_TITLE,
          description: profile.short_bio || DEFAULT_AUTHOR_SHORT_BIO,
          image: profile.photo_url || undefined,
          birthDate: profile.birth_date || undefined,
          birthPlace: profile.birth_place || undefined,
          sameAs: SOCIAL_LINKS.map((link) => link.href),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SiteLogo className="mx-auto mb-8 h-36 w-36 sm:h-44 sm:w-44" />
        <h1 className="text-center font-serif text-4xl text-ink-900">Hakkında</h1>
        {user ? (
          <p className="mt-3 text-center">
            <Link to={AUTHOR_ADMIN_PATH} className="text-sm text-burgundy-700 hover:underline">
              Özgeçmişi düzenle
            </Link>
          </p>
        ) : null}

        <section className="mt-12 grid items-start gap-8 sm:grid-cols-[11rem_1fr]">
          <div className="bg-cream-100">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center font-serif text-4xl text-ink-500">
                İH
              </div>
            )}
          </div>
          <div>
            <h2 className="font-serif text-3xl text-ink-900">{profile.full_name}</h2>
            {profile.title ? <p className="mt-2 text-lg text-ink-600">{profile.title}</p> : null}
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
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
              <p className="mt-6 leading-relaxed text-ink-700">{profile.short_bio}</p>
            ) : null}
          </div>
        </section>

        {hasText(biography) ? (
          <section className="mt-12">
            <h2 className="font-serif text-3xl text-ink-900">Özgeçmiş</h2>
            <div
              className="prose-archive mt-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(biography) }}
            />
          </section>
        ) : null}

        <p className="mt-10 text-lg leading-relaxed text-ink-700">{intro || DEFAULT_DESCRIPTION}</p>

        <section className="mt-14 border-t border-cream-200 pt-10">
          <h2 className="font-serif text-3xl text-ink-900">Gümüşhaneli Simalar</h2>
          <p className="mt-4 leading-relaxed text-ink-700">{book}</p>
          <p className="mt-4 leading-relaxed text-ink-700">
            Bu web sitesi {AUTHOR_NAME}'in resmi sitesidir. YouTube kanalı ve Facebook hesabından da takip edilebilir.
          </p>
          <SocialLinks variant="buttons" className="mt-6" />
          <Link
            to={AUTHOR_PAGE_PATH}
            className="mt-8 inline-flex items-center bg-ink-900 px-5 py-3 text-sm font-medium text-white hover:bg-ink-700"
          >
            Kitaplarımı gör
          </Link>
        </section>

        <section className="mt-14 border-t border-cream-200 pt-10">
          <h2 className="font-serif text-3xl text-ink-900">Kitabın bölümleri</h2>
          <ol className="mt-6 space-y-2">
            {BOOK_SECTIONS.map((section, index) => (
              <li key={section.slug}>
                <Link to={`/simalar?kategori=${section.slug}`} className="hover:underline">
                  <span className="mr-3 text-sm text-ink-500">{String(index + 1).padStart(2, '0')}</span>
                  {section.name}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}

const DEFAULT_ABOUT =
  "Bu site, eğitimci, şair ve yazar İsmail Hayal'in resmi sitesidir. Gümüşhaneli Simalar Dijital Arşivi, Gümüşhane'nin geçmişten bugüne iz bırakmış insanlarını gelecek kuşaklara aktarmayı amaçlayan bir kültür ve hafıza projesidir.";

const DEFAULT_BOOK =
  'Arşiv, İsmail Hayal\'in "Gümüşhaneli Simalar" adlı eserinde yer alan kişileri dijital ortamda tanıtmak amacıyla hazırlanmıştır. Biyografiler kitabın bölümlerine göre tasnif edilir.';
