import { supabase, PEOPLE_IMAGES_BUCKET } from './supabase';
import { optimizeImage } from './image';
import { slugify } from './slug';
import { fetchAuthorBooks, fetchAuthorProfile, fetchColumnists } from './api';
import type {
  AuthorBook,
  AuthorBookFormValues,
  AuthorProfile,
  Category,
  Columnist,
  ColumnistArticle,
  ColumnistArticleFormValues,
  ColumnistFormValues,
  Person,
  PersonFormValues,
  PersonStatus,
  Source,
} from '../types';

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function yearToNumber(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function formValuesToPersonPayload(values: PersonFormValues) {
  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    display_name: emptyToNull(values.display_name),
    slug: values.slug.trim(),
    gender: emptyToNull(values.gender),
    short_bio: emptyToNull(values.short_bio),
    biography: emptyToNull(values.biography),
    education: emptyToNull(values.education),
    positions: null,
    works: null,
    notable_works: null,
    contributions: null,
    birth_date: emptyToNull(values.birth_date),
    death_date: emptyToNull(values.death_date),
    birth_place: emptyToNull(values.birth_place),
    district: emptyToNull(values.district),
    profession: emptyToNull(values.profession),
    title: emptyToNull(values.title),
    category_id: emptyToNull(values.category_id),
    featured: values.featured,
    status: values.status,
  };
}

export function sourcePayloadFromForm(personId: string, values: PersonFormValues) {
  return {
    person_id: personId,
    author: emptyToNull(values.source_author),
    book_title: emptyToNull(values.source_book_title),
    edition_year: yearToNumber(values.source_edition_year),
    page_number: emptyToNull(values.source_page_number),
    extra_source: emptyToNull(values.source_extra),
    description: emptyToNull(values.source_description),
  };
}

export function sourceIsEmpty(values: PersonFormValues): boolean {
  return [
    values.source_author,
    values.source_book_title,
    values.source_edition_year,
    values.source_page_number,
    values.source_extra,
    values.source_description,
  ].every((item) => !item.trim());
}

export async function createPerson(values: PersonFormValues): Promise<Person> {
  const payload = formValuesToPersonPayload(values);
  const { data, error } = await supabase.from('people').insert(payload).select('*').single();
  if (error) throw error;

  if (!sourceIsEmpty(values)) {
    const { error: sourceError } = await supabase
      .from('sources')
      .insert(sourcePayloadFromForm(data.id, values));
    if (sourceError) throw sourceError;
  }

  return data as Person;
}

export async function updatePerson(
  id: string,
  values: PersonFormValues,
  existingSource?: Source | null
): Promise<Person> {
  const payload = formValuesToPersonPayload(values);
  const { data, error } = await supabase.from('people').update(payload).eq('id', id).select('*').single();
  if (error) throw error;

  if (sourceIsEmpty(values)) {
    if (existingSource) {
      const { error: deleteError } = await supabase.from('sources').delete().eq('id', existingSource.id);
      if (deleteError) throw deleteError;
    }
  } else if (existingSource) {
    const { error: updateError } = await supabase
      .from('sources')
      .update(sourcePayloadFromForm(id, values))
      .eq('id', existingSource.id);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase.from('sources').insert(sourcePayloadFromForm(id, values));
    if (insertError) throw insertError;
  }

  return data as Person;
}

export async function deletePerson(person: Person): Promise<void> {
  await deletePersonStorageFolder(person.id);
  const { error } = await supabase.from('people').delete().eq('id', person.id);
  if (error) throw error;
}

export async function updatePersonStatus(id: string, status: PersonStatus): Promise<void> {
  const { error } = await supabase.from('people').update({ status }).eq('id', id);
  if (error) throw error;
}

async function deletePersonStorageFolder(personId: string): Promise<void> {
  const { data, error } = await supabase.storage.from(PEOPLE_IMAGES_BUCKET).list(personId);
  if (error || !data?.length) return;
  const paths = data.map((file) => `${personId}/${file.name}`);
  await supabase.storage.from(PEOPLE_IMAGES_BUCKET).remove(paths);
}

export async function uploadPersonImage(
  personId: string,
  file: File,
  kind: 'profile' | 'gallery'
): Promise<{ publicUrl: string; storagePath: string }> {
  const optimized = await optimizeImage(file);
  const storagePath = `${personId}/${kind}-${crypto.randomUUID()}.${optimized.ext}`;

  const { error } = await supabase.storage.from(PEOPLE_IMAGES_BUCKET).upload(storagePath, optimized.blob, {
    contentType: optimized.contentType,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(PEOPLE_IMAGES_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

export async function setProfileImage(personId: string, file: File, previousPath?: string | null) {
  const uploaded = await uploadPersonImage(personId, file, 'profile');
  if (previousPath) {
    await supabase.storage.from(PEOPLE_IMAGES_BUCKET).remove([previousPath]);
  }
  const { error } = await supabase
    .from('people')
    .update({
      profile_image_url: uploaded.publicUrl,
      profile_image_path: uploaded.storagePath,
    })
    .eq('id', personId);
  if (error) throw error;
  return uploaded;
}

export async function addGalleryImage(personId: string, file: File, caption?: string) {
  const uploaded = await uploadPersonImage(personId, file, 'gallery');
  const { data: last } = await supabase
    .from('person_images')
    .select('sort_order')
    .eq('person_id', personId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from('person_images').insert({
    person_id: personId,
    image_url: uploaded.publicUrl,
    storage_path: uploaded.storagePath,
    caption: caption?.trim() || null,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (error) throw error;
}

export async function deleteGalleryImage(imageId: string, storagePath: string) {
  await supabase.storage.from(PEOPLE_IMAGES_BUCKET).remove([storagePath]);
  const { error } = await supabase.from('person_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function clearProfileImage(personId: string, storagePath?: string | null) {
  if (storagePath) {
    await supabase.storage.from(PEOPLE_IMAGES_BUCKET).remove([storagePath]);
  }
  const { error } = await supabase
    .from('people')
    .update({ profile_image_url: null, profile_image_path: null })
    .eq('id', personId);
  if (error) throw error;
}

export async function createCategory(input: Pick<Category, 'name' | 'slug' | 'description' | 'sort_order'>) {
  const { data, error } = await supabase.from('categories').insert(input).select('*').single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(
  id: string,
  input: Partial<Pick<Category, 'name' | 'slug' | 'description' | 'sort_order'>>
) {
  const { error } = await supabase.from('categories').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertSiteSettings(entries: Record<string, string>) {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}

export async function updateSource(
  id: string,
  input: Partial<Omit<Source, 'id' | 'person_id' | 'created_at'>>
) {
  const { error } = await supabase.from('sources').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteSource(id: string) {
  const { error } = await supabase.from('sources').delete().eq('id', id);
  if (error) throw error;
}

const AUTHOR_STORAGE_PREFIX = 'author';

async function uploadAuthorFile(file: File, kind: 'profile' | 'book') {
  const optimized = await optimizeImage(file);
  const storagePath = `${AUTHOR_STORAGE_PREFIX}/${kind}-${crypto.randomUUID()}.${optimized.ext}`;
  const { error } = await supabase.storage.from(PEOPLE_IMAGES_BUCKET).upload(storagePath, optimized.blob, {
    contentType: optimized.contentType,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(PEOPLE_IMAGES_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

async function removeStoragePath(path?: string | null) {
  if (!path) return;
  await supabase.storage.from(PEOPLE_IMAGES_BUCKET).remove([path]);
}

async function currentAuthorProfile(): Promise<AuthorProfile> {
  return (
    (await fetchAuthorProfile()) ?? {
      id: 1,
      full_name: 'İsmail Hayal',
      title: null,
      short_bio: null,
      biography: null,
      birth_date: null,
      birth_place: null,
      photo_url: null,
      photo_path: null,
    }
  );
}

async function writeAuthorProfile(profile: AuthorProfile): Promise<AuthorProfile> {
  const next = { ...profile, id: 1, updated_at: new Date().toISOString() };
  await upsertSiteSettings({ author_profile: JSON.stringify(next) });
  return next;
}

async function writeAuthorBooks(books: AuthorBook[]): Promise<void> {
  await upsertSiteSettings({ author_books: JSON.stringify(books) });
}

export async function upsertAuthorProfile(
  input: Pick<AuthorProfile, 'full_name' | 'title' | 'short_bio' | 'biography' | 'birth_date' | 'birth_place'>
): Promise<AuthorProfile> {
  const current = await currentAuthorProfile();
  return writeAuthorProfile({
    ...current,
    full_name: input.full_name.trim() || 'İsmail Hayal',
    title: emptyToNull(input.title ?? ''),
    short_bio: emptyToNull(input.short_bio ?? ''),
    biography: emptyToNull(input.biography ?? ''),
    birth_date: emptyToNull(input.birth_date ?? ''),
    birth_place: emptyToNull(input.birth_place ?? ''),
  });
}

export async function setAuthorPhoto(file: File, previousPath?: string | null): Promise<AuthorProfile> {
  const uploaded = await uploadAuthorFile(file, 'profile');
  if (previousPath) await removeStoragePath(previousPath);
  const current = await currentAuthorProfile();
  return writeAuthorProfile({
    ...current,
    photo_url: uploaded.publicUrl,
    photo_path: uploaded.storagePath,
  });
}

export async function clearAuthorPhoto(previousPath?: string | null): Promise<void> {
  await removeStoragePath(previousPath);
  const current = await currentAuthorProfile();
  await writeAuthorProfile({
    ...current,
    photo_url: null,
    photo_path: null,
  });
}

export async function uniqueAuthorBookSlug(title: string, excludeId?: string): Promise<string> {
  const books = await fetchAuthorBooks({ includeUnpublished: true });
  const base = slugify(title) || 'kitap';
  let slug = base;
  let n = 2;
  while (books.some((book) => book.slug === slug && book.id !== excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function bookFromForm(
  values: AuthorBookFormValues,
  slug: string,
  sortOrder: number,
  existing?: AuthorBook
): AuthorBook {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    title: values.title.trim(),
    slug,
    year: yearToNumber(values.year),
    publisher: emptyToNull(values.publisher),
    description: emptyToNull(values.description),
    cover_url: existing?.cover_url ?? null,
    cover_path: existing?.cover_path ?? null,
    sort_order: sortOrder,
    published: values.published,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

export async function createAuthorBook(values: AuthorBookFormValues, slug: string): Promise<AuthorBook> {
  const books = await fetchAuthorBooks({ includeUnpublished: true });
  const sortOrder = books.reduce((max, book) => Math.max(max, book.sort_order), 0) + 1;
  const created = bookFromForm(values, slug, sortOrder);
  await writeAuthorBooks([...books, created]);
  return created;
}

export async function updateAuthorBook(
  id: string,
  values: AuthorBookFormValues,
  slug: string,
  sortOrder: number
): Promise<AuthorBook> {
  const books = await fetchAuthorBooks({ includeUnpublished: true });
  const existing = books.find((book) => book.id === id);
  if (!existing) throw new Error('Kitap bulunamadı.');
  const updated = bookFromForm(values, slug, sortOrder, existing);
  await writeAuthorBooks(books.map((book) => (book.id === id ? updated : book)));
  return updated;
}

export async function setAuthorBookCover(
  bookId: string,
  file: File,
  previousPath?: string | null
): Promise<AuthorBook> {
  const uploaded = await uploadAuthorFile(file, 'book');
  if (previousPath) await removeStoragePath(previousPath);
  const books = await fetchAuthorBooks({ includeUnpublished: true });
  const existing = books.find((book) => book.id === bookId);
  if (!existing) throw new Error('Kitap bulunamadı.');
  const updated = {
    ...existing,
    cover_url: uploaded.publicUrl,
    cover_path: uploaded.storagePath,
    updated_at: new Date().toISOString(),
  };
  await writeAuthorBooks(books.map((book) => (book.id === bookId ? updated : book)));
  return updated;
}

export async function clearAuthorBookCover(bookId: string, previousPath?: string | null): Promise<void> {
  await removeStoragePath(previousPath);
  const books = await fetchAuthorBooks({ includeUnpublished: true });
  await writeAuthorBooks(
    books.map((book) =>
      book.id === bookId
        ? { ...book, cover_url: null, cover_path: null, updated_at: new Date().toISOString() }
        : book
    )
  );
}

export async function deleteAuthorBook(book: AuthorBook): Promise<void> {
  await removeStoragePath(book.cover_path);
  const books = await fetchAuthorBooks({ includeUnpublished: true });
  await writeAuthorBooks(books.filter((item) => item.id !== book.id));
}

function uniqueSlug(base: string, taken: Set<string>, fallback = 'yazi'): string {
  const root = slugify(base) || fallback;
  let slug = root;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

async function writeColumnists(list: Columnist[]): Promise<void> {
  await upsertSiteSettings({ columnists: JSON.stringify(list) });
}

async function uploadColumnistPhoto(file: File) {
  const optimized = await optimizeImage(file);
  const storagePath = `columnists/${crypto.randomUUID()}.${optimized.ext}`;
  const { error } = await supabase.storage.from(PEOPLE_IMAGES_BUCKET).upload(storagePath, optimized.blob, {
    contentType: optimized.contentType,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(PEOPLE_IMAGES_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

export async function createColumnist(values: ColumnistFormValues, photo?: File | null): Promise<Columnist> {
  const list = await fetchColumnists({ includeUnpublished: true });
  const now = new Date().toISOString();
  const taken = new Set(list.map((item) => item.slug));
  let photo_url: string | null = null;
  let photo_path: string | null = null;
  if (photo) {
    const uploaded = await uploadColumnistPhoto(photo);
    photo_url = uploaded.publicUrl;
    photo_path = uploaded.storagePath;
  }
  const created: Columnist = {
    id: crypto.randomUUID(),
    name: values.name.trim(),
    slug: uniqueSlug(values.name, taken, 'yazar'),
    title: emptyToNull(values.title),
    photo_url,
    photo_path,
    published: values.published,
    sort_order: list.reduce((max, item) => Math.max(max, item.sort_order), 0) + 1,
    created_at: now,
    updated_at: now,
    articles: [],
  };
  await writeColumnists([...list, created]);
  return created;
}

export async function updateColumnist(
  id: string,
  values: ColumnistFormValues,
  photo?: File | null,
  clearPhoto = false
): Promise<Columnist> {
  const list = await fetchColumnists({ includeUnpublished: true });
  const existing = list.find((item) => item.id === id);
  if (!existing) throw new Error('Köşe yazarı bulunamadı.');
  let photo_url = existing.photo_url;
  let photo_path = existing.photo_path;
  if (clearPhoto) {
    await removeStoragePath(photo_path);
    photo_url = null;
    photo_path = null;
  } else if (photo) {
    const uploaded = await uploadColumnistPhoto(photo);
    await removeStoragePath(photo_path);
    photo_url = uploaded.publicUrl;
    photo_path = uploaded.storagePath;
  }
  const updated: Columnist = {
    ...existing,
    name: values.name.trim(),
    title: emptyToNull(values.title),
    photo_url,
    photo_path,
    published: values.published,
    updated_at: new Date().toISOString(),
  };
  await writeColumnists(list.map((item) => (item.id === id ? updated : item)));
  return updated;
}

export async function deleteColumnist(columnist: Columnist): Promise<void> {
  await removeStoragePath(columnist.photo_path);
  const list = await fetchColumnists({ includeUnpublished: true });
  await writeColumnists(list.filter((item) => item.id !== columnist.id));
}

export async function createColumnistArticle(
  columnistId: string,
  values: ColumnistArticleFormValues
): Promise<ColumnistArticle> {
  const list = await fetchColumnists({ includeUnpublished: true });
  const existing = list.find((item) => item.id === columnistId);
  if (!existing) throw new Error('Köşe yazarı bulunamadı.');
  const now = new Date().toISOString();
  const taken = new Set(existing.articles.map((article) => article.slug));
  const created: ColumnistArticle = {
    id: crypto.randomUUID(),
    title: values.title.trim(),
    slug: uniqueSlug(values.title, taken),
    body: values.body.trim(),
    published: values.published,
    created_at: now,
    updated_at: now,
  };
  await writeColumnists(
    list.map((item) =>
      item.id === columnistId
        ? { ...item, articles: [created, ...item.articles], updated_at: now }
        : item
    )
  );
  return created;
}

export async function updateColumnistArticle(
  columnistId: string,
  articleId: string,
  values: ColumnistArticleFormValues
): Promise<ColumnistArticle> {
  const list = await fetchColumnists({ includeUnpublished: true });
  const existing = list.find((item) => item.id === columnistId);
  if (!existing) throw new Error('Köşe yazarı bulunamadı.');
  const article = existing.articles.find((item) => item.id === articleId);
  if (!article) throw new Error('Yazı bulunamadı.');
  const now = new Date().toISOString();
  const updated: ColumnistArticle = {
    ...article,
    title: values.title.trim(),
    body: values.body.trim(),
    published: values.published,
    updated_at: now,
  };
  await writeColumnists(
    list.map((item) =>
      item.id === columnistId
        ? {
            ...item,
            updated_at: now,
            articles: item.articles.map((entry) => (entry.id === articleId ? updated : entry)),
          }
        : item
    )
  );
  return updated;
}

export async function deleteColumnistArticle(columnistId: string, articleId: string): Promise<void> {
  const list = await fetchColumnists({ includeUnpublished: true });
  const now = new Date().toISOString();
  await writeColumnists(
    list.map((item) =>
      item.id === columnistId
        ? { ...item, updated_at: now, articles: item.articles.filter((article) => article.id !== articleId) }
        : item
    )
  );
}
