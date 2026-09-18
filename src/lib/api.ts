import { PEOPLE_IMAGES_BUCKET, supabase } from './supabase';
import { lastNameStartsWithLetter, sanitizeSearchTerm } from './slug';
import { PAGE_SIZE } from './constants';
import { blobToDataUrl, isAllowedImage, optimizeImage } from './image';
import type {
  AuthorBook,
  AuthorProfile,
  BiographySubmission,
  Category,
  Columnist,
  ColumnistArticle,
  Person,
  PersonSearchParams,
  Poem,
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

  if (query && !params.letter) {
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

  if (params.sortAlpha || params.letter) {
    request = request.order('last_name', { ascending: true }).order('first_name', { ascending: true });
  } else {
    request = request.order('featured', { ascending: false }).order('last_name', { ascending: true });
  }

  if (params.letter) {
    const { data, error } = await request;
    if (error) throw error;
    const items = ((data as Person[]) ?? []).filter((person) =>
      lastNameStartsWithLetter(person.last_name, params.letter as string)
    );
    return { items: items.slice(from, to + 1), total: items.length };
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

const PHOTO_URL_MARK = '[[VESIKALIK_URL]]';
const PHOTO_PATH_MARK = '[[VESIKALIK_PATH]]';
const PHOTO_DATA_MARK = '[[VESIKALIK_DATA]]';
const PHOTO_NOTES_SPLIT = '\n[[NOTES]]\n';
const VESIKALIK_MAX_WIDTH = 900;

export function parseSubmissionPhoto(item: Pick<BiographySubmission, 'notes' | 'photo_url' | 'photo_path'>): {
  photoUrl: string | null;
  photoPath: string | null;
  notes: string | null;
} {
  let photoUrl = item.photo_url?.trim() || null;
  let photoPath = item.photo_path?.trim() || null;
  let notes = item.notes ?? '';

  const takeMark = (mark: string) => {
    const line = notes.split('\n').find((entry) => entry.startsWith(mark));
    return line ? line.slice(mark.length).trim() : '';
  };

  if (!photoUrl) photoUrl = takeMark(PHOTO_URL_MARK) || takeMark(PHOTO_DATA_MARK) || null;
  if (!photoPath) photoPath = takeMark(PHOTO_PATH_MARK) || null;

  if (notes.includes(PHOTO_NOTES_SPLIT)) {
    notes = notes.split(PHOTO_NOTES_SPLIT).slice(1).join(PHOTO_NOTES_SPLIT);
  } else if (
    notes.startsWith(PHOTO_URL_MARK) ||
    notes.startsWith(PHOTO_PATH_MARK) ||
    notes.startsWith(PHOTO_DATA_MARK)
  ) {
    notes = '';
  }

  return { photoUrl, photoPath, notes: notes.trim() || null };
}

function encodeSubmissionNotes(
  notes: string,
  photo: { url?: string | null; path?: string | null; dataUrl?: string | null }
): string | null {
  const lines: string[] = [];
  if (photo.url) lines.push(`${PHOTO_URL_MARK}${photo.url}`);
  if (photo.path) lines.push(`${PHOTO_PATH_MARK}${photo.path}`);
  if (photo.dataUrl && !photo.url) lines.push(`${PHOTO_DATA_MARK}${photo.dataUrl}`);
  const userNotes = notes.trim();
  if (!lines.length) return userNotes || null;
  return userNotes ? `${lines.join('\n')}${PHOTO_NOTES_SPLIT}${userNotes}` : lines.join('\n');
}

function isMissingPhotoColumn(message?: string): boolean {
  const text = message?.toLowerCase() ?? '';
  return text.includes('photo_url') || text.includes('photo_path') || text.includes('pgrst204');
}

async function uploadSubmissionPhoto(file: File): Promise<{
  photo_url: string | null;
  photo_path: string | null;
  dataUrl: string | null;
}> {
  if (!isAllowedImage(file)) {
    throw new Error('Vesikalık yalnızca JPG, PNG veya WEBP olabilir.');
  }
  const optimized = await optimizeImage(file, VESIKALIK_MAX_WIDTH);
  const storagePath = `submissions/${crypto.randomUUID()}.${optimized.ext}`;
  const { error } = await supabase.storage.from(PEOPLE_IMAGES_BUCKET).upload(storagePath, optimized.blob, {
    contentType: optimized.contentType,
    upsert: false,
  });
  if (!error) {
    const { data } = supabase.storage.from(PEOPLE_IMAGES_BUCKET).getPublicUrl(storagePath);
    return { photo_url: data.publicUrl, photo_path: storagePath, dataUrl: null };
  }
  return { photo_url: null, photo_path: null, dataUrl: await blobToDataUrl(optimized.blob) };
}

export async function createBiographySubmission(
  input: {
    full_name: string;
    email?: string;
    category_id?: string;
    profession?: string;
    birth_place?: string;
    biography: string;
    notes?: string;
  },
  photo?: File | null
): Promise<void> {
  let photo_url: string | null = null;
  let photo_path: string | null = null;
  let dataUrl: string | null = null;

  if (photo) {
    const uploaded = await uploadSubmissionPhoto(photo);
    photo_url = uploaded.photo_url;
    photo_path = uploaded.photo_path;
    dataUrl = uploaded.dataUrl;
  }

  const notes = input.notes?.trim() || null;
  const row = {
    full_name: input.full_name.trim(),
    email: input.email?.trim() || null,
    category_id: input.category_id || null,
    profession: input.profession?.trim() || null,
    birth_place: input.birth_place?.trim() || null,
    biography: input.biography.trim(),
    notes,
    photo_url: photo_url || dataUrl,
    photo_path,
    status: 'pending' as const,
  };

  const { error } = await supabase.from('biography_submissions').insert(row);
  if (!error) return;
  if (!isMissingPhotoColumn(error.message) && !photo) throw error;

  const { error: fallbackError } = await supabase.from('biography_submissions').insert({
    full_name: row.full_name,
    email: row.email,
    category_id: row.category_id,
    profession: row.profession,
    birth_place: row.birth_place,
    biography: row.biography,
    notes: encodeSubmissionNotes(notes ?? '', { url: photo_url, path: photo_path, dataUrl }),
    status: 'pending',
  });
  if (fallbackError) throw fallbackError;
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

export async function updateSubmission(
  id: string,
  input: {
    full_name: string;
    email?: string | null;
    category_id?: string | null;
    profession?: string | null;
    birth_place?: string | null;
    biography: string;
    notes?: string | null;
    status?: SubmissionStatus;
  },
  options?: {
    photo?: File | null;
    clearPhoto?: boolean;
    current?: BiographySubmission;
  }
): Promise<BiographySubmission> {
  const parsed = parseSubmissionPhoto(
    options?.current ?? { notes: input.notes ?? null, photo_url: null, photo_path: null }
  );
  let photo_url = parsed.photoUrl;
  let photo_path = parsed.photoPath;
  const userNotes = input.notes ?? parsed.notes;

  async function removeStoredPhoto(path: string | null) {
    if (!path || path.startsWith('data:')) return;
    await supabase.storage.from(PEOPLE_IMAGES_BUCKET).remove([path]).catch(() => undefined);
  }

  if (options?.clearPhoto) {
    await removeStoredPhoto(photo_path);
    photo_url = null;
    photo_path = null;
  }

  if (options?.photo) {
    await removeStoredPhoto(photo_path);
    const uploaded = await uploadSubmissionPhoto(options.photo);
    photo_url = uploaded.photo_url || uploaded.dataUrl;
    photo_path = uploaded.photo_path;
  }

  const base = {
    full_name: input.full_name.trim(),
    email: input.email?.trim() || null,
    category_id: input.category_id || null,
    profession: input.profession?.trim() || null,
    birth_place: input.birth_place?.trim() || null,
    biography: input.biography.trim(),
    notes: userNotes?.trim() || null,
    ...(input.status ? { status: input.status } : {}),
  };

  const { data, error } = await supabase
    .from('biography_submissions')
    .update({ ...base, photo_url, photo_path })
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (!error) return data as BiographySubmission;
  if (!isMissingPhotoColumn(error.message)) throw error;

  const { data: fallback, error: fallbackError } = await supabase
    .from('biography_submissions')
    .update({
      ...base,
      notes: encodeSubmissionNotes(userNotes ?? '', {
        url: photo_url?.startsWith('data:') ? null : photo_url,
        path: photo_path,
        dataUrl: photo_url?.startsWith('data:') ? photo_url : null,
      }),
    })
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (fallbackError) throw fallbackError;
  return fallback as BiographySubmission;
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

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function sortAuthorBooks(books: AuthorBook[]): AuthorBook[] {
  return [...books].sort((a, b) => {
    if ((b.year ?? 0) !== (a.year ?? 0)) return (b.year ?? 0) - (a.year ?? 0);
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title, 'tr');
  });
}

export async function fetchAuthorProfile(): Promise<AuthorProfile | null> {
  const settings = await fetchSiteSettings();
  const parsed = parseJson<Partial<AuthorProfile> | null>(settings.author_profile, null);
  if (!parsed) return null;
  return {
    id: 1,
    full_name: parsed.full_name || 'İsmail Hayal',
    title: parsed.title ?? null,
    short_bio: parsed.short_bio ?? null,
    biography: parsed.biography ?? null,
    birth_date: parsed.birth_date ?? null,
    birth_place: parsed.birth_place ?? null,
    photo_url: parsed.photo_url ?? null,
    photo_path: parsed.photo_path ?? null,
    updated_at: parsed.updated_at,
  };
}

export async function fetchAuthorBooks(options?: { includeUnpublished?: boolean }): Promise<AuthorBook[]> {
  const settings = await fetchSiteSettings();
  const books = parseJson<AuthorBook[]>(settings.author_books, []);
  const list = Array.isArray(books) ? books : [];
  const visible = options?.includeUnpublished ? list : list.filter((book) => book.published);
  return sortAuthorBooks(visible);
}

export async function fetchAuthorBookBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean }
): Promise<AuthorBook | null> {
  const books = await fetchAuthorBooks(options);
  return books.find((book) => book.slug === slug) ?? null;
}

function normalizeColumnist(raw: Partial<Columnist> & { name?: string }): Columnist | null {
  if (!raw?.name || !raw.id) return null;
  const articles = Array.isArray(raw.articles)
    ? raw.articles
        .filter((article): article is ColumnistArticle => Boolean(article?.id && article?.title && article?.slug))
        .map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          body: article.body ?? '',
          published: article.published !== false,
          created_at: article.created_at,
          updated_at: article.updated_at,
        }))
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    : [];
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug || 'yazar',
    title: raw.title ?? null,
    photo_url: raw.photo_url ?? null,
    photo_path: raw.photo_path ?? null,
    published: raw.published !== false,
    sort_order: raw.sort_order ?? 0,
    created_at: raw.created_at ?? '',
    updated_at: raw.updated_at ?? '',
    articles,
  };
}

function sortColumnists(list: Columnist[]): Columnist[] {
  return [...list].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.name.localeCompare(b.name, 'tr');
  });
}

export async function fetchColumnists(options?: { includeUnpublished?: boolean }): Promise<Columnist[]> {
  const settings = await fetchSiteSettings();
  const parsed = parseJson<Partial<Columnist>[]>(settings.columnists, []);
  const list = (Array.isArray(parsed) ? parsed : [])
    .map(normalizeColumnist)
    .filter((item): item is Columnist => Boolean(item));
  const visible = options?.includeUnpublished ? list : list.filter((item) => item.published);
  return sortColumnists(
    visible.map((item) => ({
      ...item,
      articles: options?.includeUnpublished ? item.articles : item.articles.filter((article) => article.published),
    }))
  );
}

export async function fetchColumnistBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean }
): Promise<Columnist | null> {
  const list = await fetchColumnists(options);
  return list.find((item) => item.slug === slug) ?? null;
}

export async function fetchColumnistArticle(
  columnistSlug: string,
  articleSlug: string,
  options?: { includeUnpublished?: boolean }
): Promise<{ columnist: Columnist; article: ColumnistArticle } | null> {
  const columnist = await fetchColumnistBySlug(columnistSlug, options);
  if (!columnist) return null;
  const article = columnist.articles.find((item) => item.slug === articleSlug);
  if (!article) return null;
  return { columnist, article };
}

export async function fetchPoems(options?: { includeUnpublished?: boolean }): Promise<Poem[]> {
  const settings = await fetchSiteSettings();
  const parsed = parseJson<Partial<Poem>[]>(settings.poems, []);
  const list = (Array.isArray(parsed) ? parsed : [])
    .filter((item): item is Poem => Boolean(item?.id && item?.title && item?.slug))
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      body: item.body ?? '',
      image_url: item.image_url ?? null,
      image_path: item.image_path ?? null,
      published: item.published !== false,
      created_at: item.created_at ?? '',
      updated_at: item.updated_at ?? '',
    }));
  const visible = options?.includeUnpublished ? list : list.filter((item) => item.published);
  return visible.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

export async function fetchPoemBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean }
): Promise<Poem | null> {
  const list = await fetchPoems(options);
  return list.find((item) => item.slug === slug) ?? null;
}

export const REACTION_KEYS = ['love', 'dislike', 'laugh', 'sad', 'angry', 'wow'] as const;
export type ReactionKey = (typeof REACTION_KEYS)[number];
export type ReactionCounts = Record<ReactionKey, number>;

const REACTION_CHOICE_PREFIX = 'gs-reaction:';
const REACTION_COUNTS_PREFIX = 'gs-reaction-counts:';

export function emptyReactions(): ReactionCounts {
  return { love: 0, dislike: 0, laugh: 0, sad: 0, angry: 0, wow: 0 };
}

export function isReactionKey(value: string | null | undefined): value is ReactionKey {
  return Boolean(value && REACTION_KEYS.includes(value as ReactionKey));
}

function normalizeCounts(input: unknown): ReactionCounts {
  const counts = emptyReactions();
  if (!input || typeof input !== 'object') return counts;
  for (const key of REACTION_KEYS) {
    const value = Number((input as Record<string, unknown>)[key]);
    if (Number.isFinite(value) && value >= 0) counts[key] = Math.floor(value);
  }
  return counts;
}

function applyReactionVote(
  counts: ReactionCounts,
  reaction: ReactionKey,
  previous: ReactionKey | null
): ReactionCounts {
  const next = { ...counts };
  if (previous === reaction) {
    next[reaction] = Math.max(0, next[reaction] - 1);
  } else {
    if (previous) next[previous] = Math.max(0, next[previous] - 1);
    next[reaction] += 1;
  }
  return next;
}

export function readStoredReaction(key: string): ReactionKey | null {
  try {
    const value = localStorage.getItem(REACTION_CHOICE_PREFIX + key);
    return isReactionKey(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStoredReaction(key: string, reaction: ReactionKey | null) {
  try {
    if (reaction) localStorage.setItem(REACTION_CHOICE_PREFIX + key, reaction);
    else localStorage.removeItem(REACTION_CHOICE_PREFIX + key);
  } catch {
    /* ignore */
  }
}

function readLocalReactionCounts(key: string): ReactionCounts {
  try {
    return normalizeCounts(JSON.parse(localStorage.getItem(REACTION_COUNTS_PREFIX + key) || '{}'));
  } catch {
    return emptyReactions();
  }
}

function writeLocalReactionCounts(key: string, counts: ReactionCounts) {
  try {
    localStorage.setItem(REACTION_COUNTS_PREFIX + key, JSON.stringify(counts));
  } catch {
    /* ignore */
  }
}

export async function fetchContentReactions(key: string): Promise<ReactionCounts> {
  const settings = await fetchSiteSettings();
  const tree = parseJson<Record<string, Partial<ReactionCounts>>>(settings.content_reactions, {});
  const server = normalizeCounts(tree[key]);
  if (Object.values(server).some((count) => count > 0)) return server;
  return readLocalReactionCounts(key);
}

export async function submitContentReaction(
  key: string,
  reaction: ReactionKey,
  previous: ReactionKey | null
): Promise<ReactionCounts> {
  const nextChoice = previous === reaction ? null : reaction;
  const { data, error } = await supabase.rpc('react_to_content', {
    p_key: key,
    p_reaction: reaction,
    p_previous: previous ?? '',
  });

  if (!error && data) {
    const counts = normalizeCounts(data);
    writeStoredReaction(key, nextChoice);
    writeLocalReactionCounts(key, counts);
    return counts;
  }

  const counts = applyReactionVote(readLocalReactionCounts(key), reaction, previous);
  writeStoredReaction(key, nextChoice);
  writeLocalReactionCounts(key, counts);
  return counts;
}
