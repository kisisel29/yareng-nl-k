import { supabase } from './supabase';
import { letterFilterVariants, sanitizeSearchTerm } from './slug';
import { PAGE_SIZE } from './constants';
import type {
  BiographySubmission,
  Category,
  Person,
  PersonSearchParams,
  SiteSettingsMap,
  Source,
  SubmissionStatus,
} from '../types';

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

  if (params.letter) {
    const variants = letterFilterVariants(params.letter);
    request = request.or(variants.map((item) => `last_name.ilike.${item}%`).join(','));
  }

  if (params.sortAlpha || params.letter) {
    request = request.order('last_name', { ascending: true }).order('first_name', { ascending: true });
  } else {
    request = request.order('featured', { ascending: false }).order('last_name', { ascending: true });
  }

  const { data, error, count } = await request.range(from, to);
  if (error) throw error;
  return { items: (data as Person[]) ?? [], total: count ?? 0 };
}

export async function fetchLatestPeople(limit = 8): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Person[]) ?? [];
}

export async function fetchMostViewedPeople(limit = 8): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) return fetchLatestPeople(limit);
  return (data as Person[]) ?? [];
}

export async function fetchRandomPeople(limit = 8): Promise<Person[]> {
  const { data: ids, error } = await supabase.rpc('random_published_person_ids', { p_limit: limit });
  if (error || !ids?.length) {
    const latest = await fetchLatestPeople(limit);
    return latest.slice().sort(() => Math.random() - 0.5);
  }

  const { data, error: peopleError } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .in(
      'id',
      ids.map((row: { id: string }) => row.id)
    );

  if (peopleError) throw peopleError;
  return (data as Person[]) ?? [];
}

export async function fetchRelatedPeople(
  categoryId: string | null | undefined,
  excludeId: string,
  limit = 4
): Promise<Person[]> {
  if (!categoryId) return [];
  const { data, error } = await supabase
    .from('people')
    .select(PERSON_SELECT)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('last_name', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data as Person[]) ?? [];
}

export async function incrementPersonViews(slug: string): Promise<void> {
  await supabase.rpc('increment_person_views', { p_slug: slug });
}

export async function createBiographySubmission(input: {
  full_name: string;
  email?: string;
  category_id?: string;
  profession?: string;
  birth_place?: string;
  biography: string;
  notes?: string;
}): Promise<void> {
  const { error } = await supabase.from('biography_submissions').insert({
    full_name: input.full_name.trim(),
    email: input.email?.trim() || null,
    category_id: input.category_id || null,
    profession: input.profession?.trim() || null,
    birth_place: input.birth_place?.trim() || null,
    biography: input.biography.trim(),
    notes: input.notes?.trim() || null,
    status: 'pending',
  });
  if (error) throw error;
}

export async function fetchSubmissions(status?: SubmissionStatus | 'all'): Promise<BiographySubmission[]> {
  let request = supabase
    .from('biography_submissions')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    request = request.eq('status', status);
  }

  const { data, error } = await request;
  if (error) throw error;
  return (data as BiographySubmission[]) ?? [];
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
  const { error } = await supabase.from('biography_submissions').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteSubmission(id: string): Promise<void> {
  const { error } = await supabase.from('biography_submissions').delete().eq('id', id);
  if (error) throw error;
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
  const [total, published, draft, categories, noPhoto, pending] = await Promise.all([
    supabase.from('people').select('id', { count: 'exact', head: true }),
    supabase.from('people').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('people').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase
      .from('people')
      .select('id', { count: 'exact', head: true })
      .or('profile_image_url.is.null,profile_image_url.eq.'),
    supabase
      .from('biography_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const firstError = total.error || published.error || draft.error || categories.error || noPhoto.error;
  if (firstError) throw firstError;

  return {
    totalPeople: total.count ?? 0,
    publishedPeople: published.count ?? 0,
    draftPeople: draft.count ?? 0,
    totalCategories: categories.count ?? 0,
    noPhotoPeople: noPhoto.count ?? 0,
    pendingSubmissions: pending.error ? 0 : pending.count ?? 0,
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
