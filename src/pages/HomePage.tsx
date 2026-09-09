import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBox } from '../components/people/SearchBox';
import { PersonGrid } from '../components/people/PersonGrid';
import { ChapterIndex } from '../components/people/ChapterIndex';
import { AlphabetIndex } from '../components/people/AlphabetIndex';
import { PersonRail } from '../components/people/PersonRail';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/seo/Seo';
import { SiteBanner, SITE_BANNER_SRC } from '../components/brand/SiteBanner';
import { SiteLogo } from '../components/brand/SiteLogo';
import { SectionTitle } from '../components/brand/SectionTitle';
import { PersonPlaceholder } from '../components/people/PersonPlaceholder';
import { fetchAuthorBooks, fetchCategories, fetchFeaturedPeople, fetchLatestPeople, fetchMostViewedPeople, fetchPublishedCount, fetchRandomPeople, searchPeople } from '../lib/api';
import {
  AUTHOR_NAME,
  AUTHOR_PAGE_PATH,
  BOOK_SECTIONS,
  DEFAULT_DESCRIPTION,
  PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  SITE_NAME,
  SOCIAL_LINKS,
} from '../lib/constants';
import { formatLifeYears, personName, siteUrl } from '../lib/format';
import { useDebounce } from '../hooks/useDebounce';
import { BookCard } from '../components/author/BookCard';
import type { AuthorBook, Category, Person } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [featured, setFeatured] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [latest, setLatest] = useState<Person[]>([]);
  const [popular, setPopular] = useState<Person[]>([]);
  const [random, setRandom] = useState<Person[]>([]);
  const [books, setBooks] = useState<AuthorBook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchFeaturedPeople(),
      searchPeople({ page: 1, pageSize: PAGE_SIZE }),
      fetchPublishedCount(),
      fetchCategories(),
      fetchLatestPeople(8),
      fetchMostViewedPeople(8),
      fetchRandomPeople(8),
      fetchAuthorBooks(),
    ])
      .then(([featuredPeople, listed, total, cats, latestPeople, popularPeople, randomPeople, authorBooks]) => {
        if (!active) return;
        setFeatured(featuredPeople);
        setPeople(listed.items);
        setCount(total);
        setCategories(cats);
        setLatest(latestPeople);
        setPopular(popularPeople);
        setRandom(randomPeople);
        setBooks(authorBooks);
      })
      .catch(() => {
        if (!active) return;
        setFeatured([]);
        setPeople([]);
        setCount(0);
        setCategories([]);
        setLatest([]);
        setPopular([]);
        setRandom([]);
        setBooks([]);
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

  const chapterCategories = useMemo(() => {
    if (!categories.length) {
      return BOOK_SECTIONS.map((section, index) => ({
        id: section.slug,
        name: section.name,
        slug: section.slug,
        description: null,
        sort_order: index + 1,
        created_at: '',
        updated_at: '',
      }));
    }
    const order = new Map(BOOK_SECTIONS.map((section, index) => [section.slug, index]));
    return [...categories].sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));
  }, [categories]);

  const hero = featured[0] ?? null;
  const restFeatured = featured.slice(1);

  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: siteUrl(),
        description: DEFAULT_DESCRIPTION,
        author: {
          '@type': 'Person',
          name: AUTHOR_NAME,
          url: siteUrl(),
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl()}/simalar?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: AUTHOR_NAME,
        url: siteUrl(),
        jobTitle: 'Eğitimci, şair ve yazar',
        sameAs: SOCIAL_LINKS.map((link) => link.href),
      },
    ],
    []
  );

  return (
    <>
      <Seo jsonLd={jsonLd} image={`${siteUrl()}${SITE_BANNER_SRC}`} />

      <section className="border-b border-cream-200">
        <SiteBanner />
        <div className="mx-auto max-w-3xl px-4 pb-10 text-center sm:px-6 sm:pb-14">
          <SiteLogo
            className="relative z-10 mx-auto -mt-8 h-[5.5rem] w-[5.5rem] sm:-mt-12 sm:h-28 sm:w-28"
            decorative
          />
          <p className="mt-5 text-sm text-ink-500">İsmail Hayal'in resmi sitesi · {count} isim</p>
          <h1 className="mt-4 font-calibri text-3xl font-bold leading-tight tracking-wide text-ink-900 sm:text-5xl">
            GÜMÜŞHANE'NİN İZ BIRAKANLARINI TANIYALIM
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-600">
            Eğitimci ve yazar İsmail Hayal'in Gümüşhaneli Simalar eserinden yola çıkan dijital biyografi arşivi.
          </p>
          <div className="relative mx-auto mt-8 max-w-xl text-left">
            <SearchBox
              value={query}
              onChange={setQuery}
              large
              onSubmit={() => navigate(`/simalar?q=${encodeURIComponent(query.trim())}`)}
            />
            {suggestions.length > 0 ? (
              <ul className="absolute z-20 mt-1 w-full border border-cream-200 bg-white text-left">
                {suggestions.map((person) => (
                  <li key={person.id} className="border-t border-cream-100 first:border-t-0">
                    <Link to={`/simalar/${person.slug}`} className="block px-4 py-3 text-sm hover:bg-cream-100">
                      {personName(person)}
                      {person.profession ? (
                        <span className="ml-2 text-ink-500">{person.profession}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-cream-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cream-300">İsmail Hayal</p>
              <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Kitaplarım</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream-200 sm:text-base">
                Gümüşhane'nin insan hafızasını kayıt altına alan eserler.
              </p>
            </div>
            <Link
              to={AUTHOR_PAGE_PATH}
              className="inline-flex items-center justify-center bg-white px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-cream-100"
            >
              Tüm kitapları gör
            </Link>
          </div>
          {books.length > 0 ? (
            <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {books.slice(0, 4).map((book) => (
                <li key={book.id}>
                  <BookCard book={book} variant="dark" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-cream-200">Kitap kapakları ve yeni eserler yakında burada yer alacak.</p>
          )}
        </div>
      </section>

      <section className="border-b border-cream-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <AlphabetIndex />
        </div>
      </section>

      <PersonRail eyebrow="Güncel" title="Son eklenen / güncellenen" people={latest} actionHref="/simalar" />
      <PersonRail eyebrow="Keşif" title="En çok okunan" people={popular} showViews actionHref="/simalar" />
      <PersonRail eyebrow="Keşif" title="Rastgele simalar" people={random} />

      {hero ? (
        <section className="border-b border-cream-200">
          <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
            <div className="min-h-[22rem] bg-cream-100">
              {hero.profile_image_url ? (
                <img src={hero.profile_image_url} alt={personName(hero)} className="h-full w-full object-cover" />
              ) : (
                <PersonPlaceholder person={hero} className="h-full min-h-[22rem] w-full" />
              )}
            </div>
            <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
              <p className="text-xs uppercase tracking-[0.14em] text-ink-500">
                {hero.category?.name || 'Öne çıkan'}
              </p>
              <h2 className="mt-3 font-serif text-4xl text-ink-900">{personName(hero)}</h2>
              {formatLifeYears(hero.birth_date, hero.death_date) ? (
                <p className="mt-2 text-ink-500">{formatLifeYears(hero.birth_date, hero.death_date)}</p>
              ) : null}
              {hero.short_bio ? (
                <p className="mt-5 max-w-md leading-relaxed text-ink-600">{hero.short_bio}</p>
              ) : null}
              <Link to={`/simalar/${hero.slug}`} className="mt-6 text-sm text-burgundy-700 hover:underline">
                Hayatını oku
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Kitap" title="Bölümler" />
        <ChapterIndex categories={chapterCategories} />
      </section>

      {restFeatured.length > 0 || (loading && !hero) ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <SectionTitle eyebrow="Koleksiyon" title="Öne çıkan simalar" />
          <PersonGrid people={restFeatured.length ? restFeatured : featured} loading={loading && !hero} />
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <SectionTitle
          eyebrow="Arşiv"
          title="Tüm simalar"
          action={
            <Link to="/simalar" className="text-sm text-burgundy-700 hover:underline">
              Tümünü gör
            </Link>
          }
        />
        {!loading && people.length === 0 ? (
          <EmptyState title="Arşivde henüz yayınlanmış bir sima yok." />
        ) : (
          <PersonGrid people={people} loading={loading} />
        )}
      </section>
    </>
  );
}
