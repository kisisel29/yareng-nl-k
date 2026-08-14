import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { SocialLinks } from '../components/layout/SocialLinks';
import { fetchSiteSettings } from '../lib/api';
import { AUTHOR_NAME, BOOK_SECTIONS, DEFAULT_DESCRIPTION, SOCIAL_LINKS } from '../lib/constants';
import { siteUrl } from '../lib/format';

export function AboutPage() {
  const [intro, setIntro] = useState(DEFAULT_ABOUT);
  const [book, setBook] = useState(DEFAULT_BOOK);

  useEffect(() => {
    fetchSiteSettings()
      .then((settings) => {
        if (settings.about_intro) setIntro(settings.about_intro);
        if (settings.about_book) setBook(settings.about_book);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <Seo
        title="Hakkında"
        description="İsmail Hayal'in resmi sitesi. Gümüşhaneli Simalar dijital arşivi ve yazarın eserleri hakkında."
        path="/hakkinda"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: AUTHOR_NAME,
          url: siteUrl(),
          jobTitle: 'Eğitimci, şair ve yazar',
          sameAs: SOCIAL_LINKS.map((link) => link.href),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-4xl text-ink-900">Hakkında</h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">{intro || DEFAULT_DESCRIPTION}</p>

        <section className="mt-14 border-t border-cream-200 pt-10">
          <h2 className="font-serif text-3xl text-ink-900">İsmail Hayal ve Gümüşhaneli Simalar</h2>
          <p className="mt-4 leading-relaxed text-ink-700">{book}</p>
          <p className="mt-4 leading-relaxed text-ink-700">
            Bu web sitesi {AUTHOR_NAME}'in resmi sitesidir. YouTube kanalı ve Facebook hesabından da takip edilebilir.
          </p>
          <SocialLinks variant="buttons" className="mt-6" />
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
