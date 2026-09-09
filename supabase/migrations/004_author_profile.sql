-- İsmail Hayal özgeçmişi ve kitapları
-- Supabase SQL Editor'de bu dosyanın tamamını çalıştırın.

create table if not exists public.author_profile (
  id integer primary key default 1 check (id = 1),
  full_name text not null default 'İsmail Hayal',
  title text,
  short_bio text,
  biography text,
  birth_date date,
  birth_place text,
  photo_url text,
  photo_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.author_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  year integer,
  publisher text,
  description text,
  cover_url text,
  cover_path text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists author_books_published_idx on public.author_books (published);
create index if not exists author_books_year_idx on public.author_books (year desc);

drop trigger if exists author_profile_set_updated_at on public.author_profile;
create trigger author_profile_set_updated_at
before update on public.author_profile
for each row execute function public.set_updated_at();

drop trigger if exists author_books_set_updated_at on public.author_books;
create trigger author_books_set_updated_at
before update on public.author_books
for each row execute function public.set_updated_at();

alter table public.author_profile enable row level security;
alter table public.author_books enable row level security;

drop policy if exists "Public can read author profile" on public.author_profile;
create policy "Public can read author profile"
on public.author_profile for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert author profile" on public.author_profile;
create policy "Admins can insert author profile"
on public.author_profile for insert
to authenticated
with check (true);

drop policy if exists "Admins can update author profile" on public.author_profile;
create policy "Admins can update author profile"
on public.author_profile for update
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read published author books" on public.author_books;
create policy "Public can read published author books"
on public.author_books for select
to anon
using (published = true);

drop policy if exists "Admins can read all author books" on public.author_books;
create policy "Admins can read all author books"
on public.author_books for select
to authenticated
using (true);

drop policy if exists "Admins can insert author books" on public.author_books;
create policy "Admins can insert author books"
on public.author_books for insert
to authenticated
with check (true);

drop policy if exists "Admins can update author books" on public.author_books;
create policy "Admins can update author books"
on public.author_books for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete author books" on public.author_books;
create policy "Admins can delete author books"
on public.author_books for delete
to authenticated
using (true);

insert into public.author_profile (
  id, full_name, title, short_bio, biography, birth_date, birth_place
) values (
  1,
  'İsmail Hayal',
  'Eğitimci, şair ve yazar',
  'Gümüşhane doğumlu eğitimci, şair ve araştırmacı yazar. Gümüşhane''nin insan hafızasını kayıt altına alan kitapları ve Gümüşhaneli Simalar arşiviyle tanınır.',
  '<p>İsmail Hayal, 23 Mayıs 1969''da Gümüşhane''de doğdu. İlk, orta ve lise öğrenimini Trabzon''da, yükseköğrenimini Ankara Gazi Üniversitesi Eğitim Fakültesi''nde tamamladı.</p><p>Öğretmenlik ve idarecilik görevlerini Kars Kağızman, Gümüşhane Kürtün ve Gümüşhane''de sürdürdü. Gümüşhane Rehberlik Araştırma Merkezi müdürlüğü, Gümüşhane Ticaret Meslek Lisesi müdür başyardımcılığı ve 2012–2014 yıllarında Gümüşhane Milli Eğitim Şube Müdürlüğü görevlerinde bulundu.</p><p>Ulusal ve yerel basında şiir, makale, desen ve karikatürleri yayımlandı. Hayal Dükkanı başlığıyla uzun yıllar kültür ve sanat yazıları yazdı. Gümüşhane Gazeteciler Cemiyeti üyesidir.</p><p>Gümüşhane''nin eğitim, kültür ve insan hafızasına dair çok sayıda kitabı bulunmaktadır. Gümüşhaneli Simalar dijital arşivi, bu birikimin çevrimiçi devamıdır.</p>',
  '1969-05-23',
  'Gümüşhane'
)
on conflict (id) do nothing;

insert into public.author_books (title, slug, year, description, sort_order, published)
select * from (values
  ('Hayalce', 'hayalce', 2006, 'Şiir kitabı.', 1, true),
  ('Köyüm Demirören', 'koyum-demiroren', 2007, null, 2, true),
  ('Gümüşhaneli Şairler Antolojisi', 'gumushaneli-sairler-antolojisi', 2008, null, 3, true),
  ('Fıkralarla Gümüşhane 1', 'fikralarla-gumushane-1', 2009, null, 4, true),
  ('Gümüş Portreler', 'gumus-portreler', 2010, null, 5, true),
  ('Diyemediğim', 'diyemedigim', 2011, 'Şiir kitabı.', 6, true),
  ('Fıkralarla Gümüşhane 2', 'fikralarla-gumushane-2', 2011, null, 7, true),
  ('Hıfzı Kenan Çetiner', 'hifzi-kenan-cetiner', 2011, null, 8, true),
  ('Ekmek Arası Domates', 'ekmek-arasi-domates', 2012, null, 9, true),
  ('Mahmut Oltan Sungurlu', 'mahmut-oltan-sungurlu', 2013, null, 10, true),
  ('Ahmet Ziyaüddin Gümüşhanevi', 'ahmet-ziyauddin-gumushanevi', 2013, null, 11, true),
  ('Gümüşhane Eğitim Tarihi', 'gumushane-egitim-tarihi', 2014, null, 12, true),
  ('Gümüşhaneli 29 Renk', 'gumushaneli-29-renk', null, null, 13, true),
  ('Hatıraların Gölgesinde', 'hatiralarin-golgesinde', null, null, 14, true),
  ('Bir Şiir Gümüşhane', 'bir-siir-gumushane', null, null, 15, true),
  ('Hayal Ötesi', 'hayal-otesi', null, 'Şiir kitabı.', 16, true),
  ('Gümüşhaneli Simalar', 'gumushaneli-simalar', 2025, 'Gümüşhane''ye iz bırakmış binlerce ismin biyografilerini bir araya getiren kapsamlı eser. Bu dijital arşivin dayandığı kitaptır.', 17, true)
) as books(title, slug, year, description, sort_order, published)
where not exists (
  select 1 from public.author_books existing where existing.slug = books.slug
);
