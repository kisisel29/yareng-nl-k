import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/people/FilterBar';
import { PersonGrid } from '../components/people/PersonGrid';
import { SearchBox } from '../components/people/SearchBox';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Seo } from '../components/seo/Seo';
import { useDebounce } from '../hooks/useDebounce';
import { fetchCategories, searchPeople } from '../lib/api';
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '../lib/constants';
import type { Category, Person } from '../types';

export function PeoplePage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const categorySlug = params.get('kategori') ?? '';
  const sortAlpha = params.get('siralama') === 'az';
  const page = Math.max(1, Number(params.get('sayfa') || '1') || 1);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    searchPeople({
      query: debouncedQuery,
      categorySlug: categorySlug || undefined,
      sortAlpha,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((result) => {
        if (!active) return;
        setPeople(result.items);
        setTotal(result.total);
      })
      .catch(() => {
        if (!active) return;
        setPeople([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery, categorySlug, sortAlpha, page]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'sayfa') next.delete('sayfa');
    setParams(next);
  }

  const activeCategory = categories.find((item) => item.slug === categorySlug);

  return (
    <>
      <Seo
        title={activeCategory ? activeCategory.name : 'Simalar'}
        description="Gümüşhane tarihinde, kültüründe ve toplumsal hayatında yer edinmiş isimleri arayın ve keşfedin."
        path="/simalar"
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="font-serif text-4xl text-ink-900">
          {activeCategory ? activeCategory.name : 'Simalar'}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-600">
          {activeCategory
            ? `İsmail Hayal'in Gümüşhaneli Simalar eserindeki ${activeCategory.name} bölümü.`
            : 'Ad, soyad, meslek, doğum yeri veya kitap bölümüne göre arayın.'}
        </p>
        <div className="mt-8 max-w-xl">
          <SearchBox value={query} onChange={(value) => updateParam('q', value)} />
        </div>
        <div className="mt-6 border-y border-cream-200 py-4">
          <FilterBar
            categories={categories}
            categorySlug={categorySlug}
            sortAlpha={sortAlpha}
            onCategoryChange={(slug) => updateParam('kategori', slug)}
            onSortChange={(alpha) => updateParam('siralama', alpha ? 'az' : '')}
          />
        </div>
        <p className="mt-6 text-sm text-ink-500">{total} kayıt</p>
        <div className="mt-8">
          {!loading && people.length === 0 ? (
            <EmptyState title="Aradığınız kriterlere uygun bir sima bulunamadı." />
          ) : (
            <PersonGrid people={people} loading={loading} />
          )}
        </div>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={(nextPage) => updateParam('sayfa', String(nextPage))}
        />
      </div>
    </>
  );
}
