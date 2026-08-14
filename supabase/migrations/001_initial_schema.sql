-- Gümüşhaneli Simalar — veritabanı şeması, RLS ve örnek veriler
-- Supabase SQL Editor'de bu dosyanın tamamını çalıştırın.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tablolar
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  display_name text,
  slug text not null unique,
  gender text,
  short_bio text,
  biography text,
  education text,
  positions text,
  works text,
  notable_works text,
  contributions text,
  birth_date date,
  death_date date,
  birth_place text,
  district text,
  profession text,
  title text,
  category_id uuid references public.categories(id) on delete set null,
  profile_image_url text,
  profile_image_path text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  author text,
  book_title text,
  edition_year integer,
  page_number text,
  extra_source text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.person_images (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- İndeksler
-- ---------------------------------------------------------------------------

create index if not exists people_status_idx on public.people (status);
create index if not exists people_featured_idx on public.people (featured) where featured = true;
create index if not exists people_category_idx on public.people (category_id);
create index if not exists people_last_name_idx on public.people (last_name);
create index if not exists people_slug_idx on public.people (slug);
create index if not exists sources_person_idx on public.sources (person_id);
create index if not exists person_images_person_idx on public.person_images (person_id);

create index if not exists people_search_idx on public.people using gin (
  to_tsvector(
    'simple',
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name, '') || ' ' ||
    coalesce(display_name, '') || ' ' ||
    coalesce(profession, '') || ' ' ||
    coalesce(birth_place, '') || ' ' ||
    coalesce(district, '') || ' ' ||
    coalesce(short_bio, '') || ' ' ||
    coalesce(biography, '')
  )
);

-- ---------------------------------------------------------------------------
-- updated_at tetikleyicileri
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
before update on public.people
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.people enable row level security;
alter table public.sources enable row level security;
alter table public.person_images enable row level security;
alter table public.site_settings enable row level security;

-- Kategoriler
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
on public.categories for insert
to authenticated
with check (true);

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
on public.categories for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
on public.categories for delete
to authenticated
using (true);

-- Kişiler
drop policy if exists "Public can read published people" on public.people;
create policy "Public can read published people"
on public.people for select
to anon
using (status = 'published');

drop policy if exists "Admins can read all people" on public.people;
create policy "Admins can read all people"
on public.people for select
to authenticated
using (true);

drop policy if exists "Admins can insert people" on public.people;
create policy "Admins can insert people"
on public.people for insert
to authenticated
with check (true);

drop policy if exists "Admins can update people" on public.people;
create policy "Admins can update people"
on public.people for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete people" on public.people;
create policy "Admins can delete people"
on public.people for delete
to authenticated
using (true);

-- Kaynaklar
drop policy if exists "Public can read sources of published people" on public.sources;
create policy "Public can read sources of published people"
on public.sources for select
to anon
using (
  exists (
    select 1 from public.people
    where people.id = sources.person_id
      and people.status = 'published'
  )
);

drop policy if exists "Admins can read all sources" on public.sources;
create policy "Admins can read all sources"
on public.sources for select
to authenticated
using (true);

drop policy if exists "Admins can insert sources" on public.sources;
create policy "Admins can insert sources"
on public.sources for insert
to authenticated
with check (true);

drop policy if exists "Admins can update sources" on public.sources;
create policy "Admins can update sources"
on public.sources for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete sources" on public.sources;
create policy "Admins can delete sources"
on public.sources for delete
to authenticated
using (true);

-- Galeri görselleri
drop policy if exists "Public can read images of published people" on public.person_images;
create policy "Public can read images of published people"
on public.person_images for select
to anon
using (
  exists (
    select 1 from public.people
    where people.id = person_images.person_id
      and people.status = 'published'
  )
);

drop policy if exists "Admins can read all person images" on public.person_images;
create policy "Admins can read all person images"
on public.person_images for select
to authenticated
using (true);

drop policy if exists "Admins can insert person images" on public.person_images;
create policy "Admins can insert person images"
on public.person_images for insert
to authenticated
with check (true);

drop policy if exists "Admins can update person images" on public.person_images;
create policy "Admins can update person images"
on public.person_images for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete person images" on public.person_images;
create policy "Admins can delete person images"
on public.person_images for delete
to authenticated
using (true);

-- Site ayarları
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins can upsert site settings" on public.site_settings;
create policy "Admins can upsert site settings"
on public.site_settings for insert
to authenticated
with check (true);

drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings"
on public.site_settings for update
to authenticated
using (true)
with check (true);

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('people-images', 'people-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read people images" on storage.objects;
create policy "Public can read people images"
on storage.objects for select
to public
using (bucket_id = 'people-images');

drop policy if exists "Admins can upload people images" on storage.objects;
create policy "Admins can upload people images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'people-images');

drop policy if exists "Admins can update people images" on storage.objects;
create policy "Admins can update people images"
on storage.objects for update
to authenticated
using (bucket_id = 'people-images')
with check (bucket_id = 'people-images');

drop policy if exists "Admins can delete people images" on storage.objects;
create policy "Admins can delete people images"
on storage.objects for delete
to authenticated
using (bucket_id = 'people-images');

-- ---------------------------------------------------------------------------
-- Başlangıç verileri
-- ---------------------------------------------------------------------------

insert into public.categories (name, slug, description, sort_order) values
  ('Akademisyenler', 'akademisyenler', 'Akademisyenler', 1),
  ('Allah Dostları', 'allah-dostlari', 'Allah Dostları', 2),
  ('Asker ve Emniyetçiler', 'asker-ve-emniyetciler', 'Asker ve Emniyetçiler', 3),
  ('Belediye Başkanları', 'belediye-baskanlari', 'Belediye Başkanları', 4),
  ('Bürokratlar', 'burokratlar', 'Bürokratlar', 5),
  ('Doktorlar', 'doktorlar', 'Doktorlar', 6),
  ('Gazeteciler', 'gazeteciler', 'Gazeteciler', 7),
  ('Gönül Erleri', 'gonul-erleri', 'Gönül Erleri', 8),
  ('Hukukçular', 'hukukcular', 'Hukukçular', 9),
  ('İş İnsanları', 'is-insanlari', 'İş İnsanları', 10),
  ('Renkli ve Tarihi Simalar', 'renkli-ve-tarihi-simalar', 'Renkli ve Tarihi Simalar', 11),
  ('Sanatçılar', 'sanatcilar', 'Sanatçılar', 12),
  ('Siyasetçiler', 'siyasetciler', 'Siyasetçiler', 13),
  ('Sporcular', 'sporcular', 'Sporcular', 14),
  ('STK ve Dernek Başkanları', 'stk-ve-dernek-baskanlari', 'STK ve Dernek Başkanları', 15),
  ('Şair, Yazar ve Aşıklar', 'sair-yazar-ve-asiklar', 'Şair, Yazar ve Aşıklar', 16),
  ('Şehitlerimiz', 'sehitlerimiz', 'Şehitlerimiz', 17),
  ('Unutulmaz Eğitimciler', 'unutulmaz-egitimciler', 'Unutulmaz Eğitimciler', 18),
  ('Gümüşhane''de İz Bırakanlar', 'gumushane-de-iz-birakanlar', 'Gümüşhane''de İz Bırakanlar', 19)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  (
    'about_intro',
    'Gümüşhaneli Simalar Dijital Arşivi, Gümüşhane''nin geçmişten bugüne iz bırakmış insanlarını gelecek kuşaklara aktarmayı amaçlayan dijital bir kültür ve hafıza projesidir.'
  ),
  (
    'about_book',
    'Bu arşiv, İsmail Hayal''in Gümüşhaneli Simalar adlı eserinde yer alan kişileri dijital ortamda tanıtmak amacıyla hazırlanmıştır. Bölümler kitabın tasnifine göredir.'
  ),
  ('default_source_author', 'İsmail Hayal'),
  ('default_source_book', 'Gümüşhaneli Simalar'),
  ('default_source_year', ''),
  ('site_name', 'Gümüşhaneli Simalar'),
  ('site_tagline', 'Gümüşhane''nin İnsan Hafızası')
on conflict (key) do nothing;

insert into public.people (
  first_name, last_name, display_name, slug, short_bio, biography,
  profession, featured, status, category_id
)
select
  'Örnek',
  'Sima 1',
  'Örnek Sima 1',
  'ornek-sima-1',
  'Sistemin test edilmesi amacıyla oluşturulmuş örnek kayıttır. Gerçek bir kişiye ait değildir.',
  '<p>Bu kayıt, sistemin test edilmesi amacıyla oluşturulmuş örnek bir kayıttır. Gerçek bir kişiye ait değildir.</p><p>Yöneticiler buraya biyografi metinlerini ekleyebilir.</p>',
  'Örnek kayıt',
  true,
  'published',
  c.id
from public.categories c
where c.slug = 'renkli-ve-tarihi-simalar'
  and not exists (select 1 from public.people p where p.slug = 'ornek-sima-1')
limit 1;

insert into public.people (
  first_name, last_name, display_name, slug, short_bio, biography,
  profession, featured, status, category_id
)
select
  'Örnek',
  'Sima 2',
  'Örnek Sima 2',
  'ornek-sima-2',
  'Sistemin test edilmesi amacıyla oluşturulmuş ikinci örnek kayıttır. Gerçek bir kişiye ait değildir.',
  '<p>Bu kayıt, sistemin test edilmesi amacıyla oluşturulmuş örnek bir kayıttır. Gerçek bir kişiye ait değildir.</p>',
  'Örnek kayıt',
  false,
  'published',
  c.id
from public.categories c
where c.slug = 'unutulmaz-egitimciler'
  and not exists (select 1 from public.people p where p.slug = 'ornek-sima-2')
limit 1;

insert into public.sources (person_id, author, book_title, description)
select p.id, 'İsmail Hayal', 'Gümüşhaneli Simalar', 'Örnek kaynak kaydı'
from public.people p
where p.slug in ('ornek-sima-1', 'ornek-sima-2')
  and not exists (select 1 from public.sources s where s.person_id = p.id);
