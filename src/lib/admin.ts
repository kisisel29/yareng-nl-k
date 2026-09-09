import { supabase, PEOPLE_IMAGES_BUCKET } from './supabase';
import { optimizeImage } from './image';
import { slugify } from './slug';
import type { AuthorBook, AuthorBookFormValues, AuthorProfile, Category, Person, PersonFormValues, PersonStatus, Source } from '../types';

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

export async function upsertAuthorProfile(
  input: Pick<AuthorProfile, 'full_name' | 'title' | 'short_bio' | 'biography' | 'birth_date' | 'birth_place'>
): Promise<AuthorProfile> {
  const payload = {
    id: 1,
    full_name: input.full_name.trim() || 'İsmail Hayal',
    title: emptyToNull(input.title ?? ''),
    short_bio: emptyToNull(input.short_bio ?? ''),
    biography: emptyToNull(input.biography ?? ''),
    birth_date: emptyToNull(input.birth_date ?? ''),
    birth_place: emptyToNull(input.birth_place ?? ''),
  };
  const { data, error } = await supabase
    .from('author_profile')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as AuthorProfile;
}

export async function setAuthorPhoto(file: File, previousPath?: string | null): Promise<AuthorProfile> {
  const uploaded = await uploadAuthorFile(file, 'profile');
  if (previousPath) await removeStoragePath(previousPath);
  const { data, error } = await supabase
    .from('author_profile')
    .upsert(
      {
        id: 1,
        photo_url: uploaded.publicUrl,
        photo_path: uploaded.storagePath,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as AuthorProfile;
}

export async function clearAuthorPhoto(previousPath?: string | null): Promise<void> {
  await removeStoragePath(previousPath);
  const { error } = await supabase
    .from('author_profile')
    .update({ photo_url: null, photo_path: null })
    .eq('id', 1);
  if (error) throw error;
}

export async function authorBookSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  let request = supabase.from('author_books').select('id').eq('slug', slug);
  if (excludeId) request = request.neq('id', excludeId);
  const { data, error } = await request.maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return Boolean(data);
}

export async function uniqueAuthorBookSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || 'kitap';
  let slug = base;
  let n = 2;
  while (await authorBookSlugExists(slug, excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function bookPayloadFromForm(values: AuthorBookFormValues, slug: string, sortOrder: number) {
  return {
    title: values.title.trim(),
    slug,
    year: yearToNumber(values.year),
    publisher: emptyToNull(values.publisher),
    description: emptyToNull(values.description),
    published: values.published,
    sort_order: sortOrder,
  };
}

export async function createAuthorBook(values: AuthorBookFormValues, slug: string): Promise<AuthorBook> {
  const { data: last } = await supabase
    .from('author_books')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('author_books')
    .insert(bookPayloadFromForm(values, slug, (last?.sort_order ?? 0) + 1))
    .select('*')
    .single();
  if (error) throw error;
  return data as AuthorBook;
}

export async function updateAuthorBook(
  id: string,
  values: AuthorBookFormValues,
  slug: string,
  sortOrder: number
): Promise<AuthorBook> {
  const { data, error } = await supabase
    .from('author_books')
    .update(bookPayloadFromForm(values, slug, sortOrder))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as AuthorBook;
}

export async function setAuthorBookCover(
  bookId: string,
  file: File,
  previousPath?: string | null
): Promise<AuthorBook> {
  const uploaded = await uploadAuthorFile(file, 'book');
  if (previousPath) await removeStoragePath(previousPath);
  const { data, error } = await supabase
    .from('author_books')
    .update({ cover_url: uploaded.publicUrl, cover_path: uploaded.storagePath })
    .eq('id', bookId)
    .select('*')
    .single();
  if (error) throw error;
  return data as AuthorBook;
}

export async function clearAuthorBookCover(bookId: string, previousPath?: string | null): Promise<void> {
  await removeStoragePath(previousPath);
  const { error } = await supabase
    .from('author_books')
    .update({ cover_url: null, cover_path: null })
    .eq('id', bookId);
  if (error) throw error;
}

export async function deleteAuthorBook(book: AuthorBook): Promise<void> {
  await removeStoragePath(book.cover_path);
  const { error } = await supabase.from('author_books').delete().eq('id', book.id);
  if (error) throw error;
}
