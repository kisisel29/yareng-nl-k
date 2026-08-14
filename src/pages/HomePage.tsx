import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBox } from '../components/people/SearchBox';
import { PersonGrid } from '../components/people/PersonGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/seo/Seo';
import { fetchFeaturedPeople, fetchPublishedCount, searchPeople } from '../lib/api';
import { DEFAULT_DESCRIPTION, PAGE_SIZE, SEARCH_DEBOUNCE_MS, SITE_NAME } from '../lib/constants';
import { siteUrl } from '../lib/format';
import { useDebounce } from '../hooks/useDebounce';
import type { Person } from '../types';
import { personName } from '../lib/format';

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [featured, setFeatured] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([fetchFeaturedPeople(), searchPeople({ page: 1, pageSize: PAGE_SIZE }), fetchPublishedCount()])
      .then(([featuredPeople, listed, total]) => {
        if (!active) return;
        setFeatured(featuredPeople);
        setPeople(listed.items);
        setCount(total);
      })
      .catch(() => {
        if (!active) return;
        setFeatured([]);
        setPeople([]);
        setCount(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!debounced.trim()) {
      setSuggestions([]);
      return;
    }
    let active = true;
    searchPeople({ query: debounced, page: 1, pageSize: 6 })
      .then((result) => {
        if (active) setSuggestions(result.items);
      })
      .catch(() => {
        if (active) setSuggestions([]);
      });
    return () => {
      active = false;
    };
  }, [debounced]);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: siteUrl() + '/',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: siteUrl(),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl()}/simalar?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    }),
    []
  );

  return (
    <>
      <Seo jsonLd={jsonLd} />
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-16 text-center sm:px-6 sm:pt-24">
        <h1 className="font-serif text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
          Gümüşhane'nin iz bırakan insanlarını tanıyın.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
          Geçmişten bugüne Gümüşhane'nin kültürüne, düşünce dünyasına ve toplumsal hayatına katkı
          sunmuş isimlerden oluşan dijital biyografi arşivi.
        </p>
        <div className="relative mx-auto mt-10 max-w-xl">
          <SearchBox
            value={query}
            onChange={setQuery}
            large
            onSubmit={() => navigate(`/simalar?q=${encodeURIComponent(query.trim())}`)}
          />
          {suggestions.length > 0 ? (
            <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-cream-200 bg-white text-left shadow-card">
              {suggestions.map((person) => (
                <li key={person.id}>
                  <Link
                    to={`/simalar/${person.slug}`}
                    className="block px-4 py-3 text-sm hover:bg-cream-100"
                  >
                    {personName(person)}
                    {person.profession ? (
                      <span className="block text-xs text-ink-500">{person.profession}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <p className="mt-8 text-sm tracking-wide text-ink-500">Arşivde {count} isim</p>
      </section>

      {featured.length > 0 || loading ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-serif text-3xl text-ink-900">Öne Çıkan Simalar</h2>
          <div className="mt-6">
            <PersonGrid people={featured} loading={loading} />
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink-900">Tüm Simalar</h2>
          <Link to="/simalar" className="text-sm font-medium text-burgundy-700">
            Tümünü gör
          </Link>
        </div>
        <div className="mt-6">
          {!loading && people.length === 0 ? (
            <EmptyState title="Arşivde henüz yayınlanmış bir sima yok." />
          ) : (
            <PersonGrid people={people} loading={loading} />
          )}
        </div>
      </section>
    </>
  );
}
