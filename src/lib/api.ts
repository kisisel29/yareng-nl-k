import { supabase } from './supabase';
import { sanitizeSearchTerm } from './slug';
import { PAGE_SIZE } from './constants';
import type { Category, Person, PersonSearchParams, SiteSettingsMap, Source } from '../types';

const PERSON_SELECT = `
  *,
  category:categories(*),
  sources(*),
  images:person_images(*)
`;

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchPublishedCount(): Promise<number> {
  const { count, error } = await supabase
    .from('people')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');

  if (error) throw error;
  return count ?? 0;
}

export async function fetchFeaturedPeople(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .eq('status', 'published')
    .eq('featured', true)
    .order('last_name', { ascending: true })
    .limit(8);

  if (error) throw error;
  return (data as Person[]) ?? [];
}

export async function searchPeople(params: PersonSearchParams): Promise<{
  items: Person[];
  total: number;
}> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const query = sanitizeSearchTerm(params.query ?? '');
  const status = params.status ?? 'published';

  let request = supabase.from('people').select(PERSON_SELECT, { count: 'exact' });

  if (status !== 'all') {
    request = request.eq('status', status);
  }

  if (params.featuredOnly) {
    request = request.eq('featured', true);
  }

  if (params.categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.categorySlug)
      .maybeSingle();

    if (!category?.id) {
      return { items: [], total: 0 };
    }
    request = request.eq('category_id', category.id);
  }

  if (query) {
    const like = `%${query}%`;
    request = request.or(
      [
        `first_name.ilike.${like}`,
        `last_name.ilike.${like}`,
        `display_name.ilike.${like}`,
        `profession.ilike.${like}`,
        `title.ilike.${like}`,
        `birth_place.ilike.${like}`,
        `district.ilike.${like}`,
        `short_bio.ilike.${like}`,
        `biography.ilike.${like}`,
      ].join(',')
    );
  }

  if (params.sortAlpha) {
    request = request.order('last_name', { ascending: true }).order('first_name', { ascending: true });
  } else {
    request = request.order('featured', { ascending: false }).order('last_name', { ascending: true });
  }

  const { data, error, count } = await request.range(from, to);
  if (error) throw error;
  return { items: (data as Person[]) ?? [], total: count ?? 0 };
}

export async function fetchPersonBySlug(slug: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return (data as Person) ?? null;
}

export async function fetchSiteSettings(): Promise<Partial<SiteSettingsMap>> {
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) throw error;

  const map: Partial<SiteSettingsMap> = {};
  for (const row of data ?? []) {
    map[row.key as keyof SiteSettingsMap] = row.value ?? '';
  }
  return map;
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  let request = supabase.from('people').select('id').eq('slug', slug);
  if (excludeId) request = request.neq('id', excludeId);
  const { data, error } = await request.maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return Boolean(data);
}

export type PersonStatusFilter = 'all' | 'draft' | 'published';

export type AdminPersonFilters = {
  query?: string;
  categoryId?: string;
  status?: PersonStatusFilter;
  page?: number;
  pageSize?: number;
};

export async function fetchAdminPeople(filters: AdminPersonFilters): Promise<{
  items: Person[];
  total: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const query = sanitizeSearchTerm(filters.query ?? '');

  let request = supabase.from('people').select(PERSON_SELECT, { count: 'exact' });

  if (filters.status && filters.status !== 'all') {
    request = request.eq('status', filters.status);
  }
  if (filters.categoryId) {
    request = request.eq('category_id', filters.categoryId);
  }
  if (query) {
    const like = `%${query}%`;
    request = request.or(
      `first_name.ilike.${like},last_name.ilike.${like},display_name.ilike.${like},profession.ilike.${like},slug.ilike.${like}`
    );
  }

  const { data, error, count } = await request
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: (data as Person[]) ?? [], total: count ?? 0 };
}

export async function fetchPersonById(id: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as Person) ?? null;
}

export async function fetchAdminStats() {
  const [total, published, draft, categories, noPhoto] = await Promise.all([
    supabase.from('people').select('id', { count: 'exact', head: true }),
    supabase.from('people').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('people').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase
      .from('people')
      .select('id', { count: 'exact', head: true })
      .or('profile_image_url.is.null,profile_image_url.eq.'),
  ]);

  const firstError =
    total.error || published.error || draft.error || categories.error || noPhoto.error;
  if (firstError) throw firstError;

  return {
    totalPeople: total.count ?? 0,
    publishedPeople: published.count ?? 0,
    draftPeople: draft.count ?? 0,
    totalCategories: categories.count ?? 0,
    noPhotoPeople: noPhoto.count ?? 0,
  };
}

export async function fetchAllSources() {
  const { data, error } = await supabase
    .from('sources')
    .select('*, person:people(id, first_name, last_name, display_name, slug)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as (Source & {
    person: Pick<Person, 'id' | 'first_name' | 'last_name' | 'display_name' | 'slug'> | null;
  })[]) ?? [];
}

export async function fetchAllPeopleForExport(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .order('last_name', { ascending: true });

  if (error) throw error;
  return (data as Person[]) ?? [];
}
