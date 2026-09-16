-- Biyografi başvurularına vesikalık fotoğraf
-- SQL Editor'de 003'ten sonra çalıştırın.

alter table public.biography_submissions
  add column if not exists photo_url text,
  add column if not exists photo_path text;

drop policy if exists "Public can upload submission photos" on storage.objects;
create policy "Public can upload submission photos"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'people-images'
  and split_part(name, '/', 1) = 'submissions'
);
