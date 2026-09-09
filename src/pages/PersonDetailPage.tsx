import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { PersonPlaceholder } from '../components/people/PersonPlaceholder';
import { PersonGrid } from '../components/people/PersonGrid';
import { ShareMenu } from '../components/people/ShareMenu';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { fetchPersonBySlug, fetchRelatedPeople, incrementPersonViews } from '../lib/api';
import { formatDateTr, formatLifeYears, hasText, personExtraNotes, personName, plainTextExcerpt, siteUrl } from '../lib/format';
import { sanitizeHtml } from '../lib/sanitize';
import type { Person } from '../types';
import { NotFoundPage } from './NotFoundPage';

export function PersonDetailPage() {
  const { slug } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [related, setRelated] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setMissing(false);
    fetchPersonBySlug(slug)
      .then((result) => {
        if (!active) return;
        setPerson(result);
        setMissing(!result);
        setActiveImage(result?.profile_image_url ?? result?.images?.[0]?.image_url ?? null);
        if (result?.category_id) {
          fetchRelatedPeople(result.category_id, result.id)
            .then((items) => {
              if (active) setRelated(items);
            })
            .catch(() => {
              if (active) setRelated([]);
            });
        } else {
          setRelated([]);
        }
        if (result?.status === 'published') {
          const key = `viewed:${result.slug}`;
          try {
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, '1');
              void incrementPersonViews(result.slug);
            }
          } catch {
            void incrementPersonViews(result.slug);
          }
        }
      })
      .catch(() => {
        if (!active) return;
        setMissing(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const jsonLd = useMemo(() => {
    if (!person) return undefined;
    const name = personName(person);
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      description: person.short_bio || plainTextExcerpt(person.biography),
      image: person.profile_image_url || undefined,
      birthDate: person.birth_date || undefined,
      deathDate: person.death_date || undefined,
      birthPlace: person.birth_place || undefined,
      jobTitle: person.title || person.profession || undefined,
      url: `${siteUrl()}/simalar/${person.slug}`,
    };
  }, [person]);

  if (loading) return <DetailSkeleton />;
  if (missing || !person) return <NotFoundPage message="Bu sima arşivde bulunamadı." />;

  const name = personName(person);
  const years = formatLifeYears(person.birth_date, person.death_date);
  const pageUrl = `${siteUrl()}/simalar/${person.slug}`;
  const gallery = person.images ?? [];
  const sources = (person.sources ?? []).filter((source) =>
    [source.author, source.book_title, source.edition_year, source.page_number, source.extra_source, source.description].some(
      (item) => item != null && String(item).trim()
    )
  );

  const facts = [
    { label: 'Doğum tarihi', value: formatDateTr(person.birth_date) },
    { label: 'Ölüm tarihi', value: formatDateTr(person.death_date) },
    { label: 'Doğum yeri', value: person.birth_place },
    { label: 'İlçe', value: person.district },
    { label: 'Meslek', value: person.profession },
    { label: 'Unvan', value: person.title },
    { label: 'Kategori', value: person.category?.name },
  ].filter((item) => hasText(item.value));

  const extraNotes = personExtraNotes(person);

  return (
    <>
      <Seo
        title={name}
        description={person.short_bio || plainTextExcerpt(person.biography) || `${name} biyografisi`}
        path={`/simalar/${person.slug}`}
        image={person.profile_image_url}
        jsonLd={person.status === 'published' ? jsonLd : undefined}
        noindex={person.status !== 'published'}
      />
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm text-ink-500">
          <Link to="/simalar" className="hover:text-ink-800">
            Simalar
          </Link>
          {person.category?.slug ? (
            <>
              <span className="mx-2">/</span>
              <Link to={`/simalar?kategori=${person.category.slug}`} className="hover:text-ink-800">
                {person.category.name}
              </Link>
            </>
          ) : null}
          <span className="mx-2">/</span>
          <span>{name}</span>
        </p>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[16rem_1fr]">
          <div>
            <div className="bg-cream-100">
              {activeImage ? (
                <img src={activeImage} alt={name} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <PersonPlaceholder person={person} className="aspect-[4/5] w-full" />
              )}
            </div>
            {gallery.length > 0 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {person.profile_image_url ? (
                  <button type="button" onClick={() => setActiveImage(person.profile_image_url)} className="h-16 w-16 shrink-0 overflow-hidden border border-cream-300">
                    <img src={person.profile_image_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ) : null}
                {gallery.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImage(image.image_url)}
                    className="h-16 w-16 shrink-0 overflow-hidden border border-cream-300"
                  >
                    <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            {person.category?.name ? (
              <p className="text-xs uppercase tracking-[0.14em] text-ink-500">
                {person.category.name}
              </p>
            ) : null}
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-serif text-3xl text-ink-900 sm:text-5xl">{name}</h1>
                {years ? <p className="mt-2 text-lg text-ink-500">{years}</p> : null}
                {typeof person.view_count === 'number' ? (
                  <p className="mt-1 text-sm text-ink-500">{person.view_count} okunma</p>
                ) : null}
                {person.status !== 'published' ? (
                  <p className="mt-2 text-sm text-burgundy-700">Bu kayıt henüz yayında değil (taslak).</p>
                ) : null}
              </div>
              <ShareMenu title={name} url={pageUrl} />
            </div>

            {facts.length > 0 ? (
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="border-t border-cream-200 pt-3">
                    <dt className="text-xs uppercase tracking-wider text-ink-500">{fact.label}</dt>
                    <dd className="mt-1 text-ink-800">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>

        {hasText(person.biography) ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="font-serif text-3xl text-ink-900">Hayatı</h2>
            <div
              className="prose-archive mt-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(person.biography) }}
            />
            {extraNotes ? (
              <p className="mt-6 whitespace-pre-line text-justify text-[1.125rem] leading-[1.8] text-ink-700">
                {extraNotes}
              </p>
            ) : null}
          </section>
        ) : person.short_bio || extraNotes ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="font-serif text-3xl text-ink-900">Hayatı</h2>
            {person.short_bio ? (
              <p className="mt-6 text-justify text-[1.125rem] leading-[1.8] text-ink-700">{person.short_bio}</p>
            ) : null}
            {extraNotes ? (
              <p className="mt-6 whitespace-pre-line text-justify text-[1.125rem] leading-[1.8] text-ink-700">
                {extraNotes}
              </p>
            ) : null}
          </section>
        ) : null}

        {sources.length > 0 ? (
          <section className="mt-14 max-w-3xl border-t border-cream-200 pt-8">
            <h2 className="font-serif text-2xl text-ink-900">Kaynaklar</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              {sources.map((source) => (
                <li key={source.id}>
                  {[source.author, source.book_title, source.edition_year, source.page_number && `s. ${source.page_number}`]
                    .filter(Boolean)
                    .join(', ')}
                  {source.extra_source ? `. ${source.extra_source}` : ''}
                  {source.description ? ` — ${source.description}` : ''}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {related.length > 0 ? (
          <section className="mt-16 border-t border-cream-200 pt-10">
            <h2 className="font-serif text-2xl text-ink-900">Aynı bölümdeki simalar</h2>
            <div className="mt-6">
              <PersonGrid people={related} />
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
