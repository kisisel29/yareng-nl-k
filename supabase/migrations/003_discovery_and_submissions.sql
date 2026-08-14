-- Keşif (okunma, rastgele) ve ziyaretçi biyografi başvuruları
-- SQL Editor'de 001 ve 002'den sonra çalıştırın.

alter table public.people
  add column if not exists view_count integer not null default 0;

create index if not exists people_view_count_idx on public.people (view_count desc);

create or replace function public.people_set_updated_at()
returns trigger
language plpgsql
as $$
declare
  old_row jsonb;
  new_row jsonb;
begin
  old_row := to_jsonb(old) - 'view_count' - 'updated_at';
  new_row := to_jsonb(new) - 'view_count' - 'updated_at';
  if old_row = new_row then
    new.updated_at := old.updated_at;
    return new;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
before update on public.people
for each row execute function public.people_set_updated_at();

create or replace function public.increment_person_views(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.people
  set view_count = coalesce(view_count, 0) + 1
  where slug = p_slug
    and status = 'published';
end;
$$;

create or replace function public.random_published_person_ids(p_limit integer default 8)
returns table(id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.people p
  where p.status = 'published'
  order by random()
  limit greatest(1, least(coalesce(p_limit, 8), 24));
$$;

grant execute on function public.increment_person_views(text) to anon, authenticated;
grant execute on function public.random_published_person_ids(integer) to anon, authenticated;

create table if not exists public.biography_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  category_id uuid references public.categories(id) on delete set null,
  profession text,
  birth_place text,
  biography text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists biography_submissions_status_idx
  on public.biography_submissions (status, created_at desc);

alter table public.biography_submissions enable row level security;

drop policy if exists "Public can submit biographies" on public.biography_submissions;
create policy "Public can submit biographies"
on public.biography_submissions for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "Admins can read submissions" on public.biography_submissions;
create policy "Admins can read submissions"
on public.biography_submissions for select
to authenticated
using (true);

drop policy if exists "Admins can update submissions" on public.biography_submissions;
create policy "Admins can update submissions"
on public.biography_submissions for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete submissions" on public.biography_submissions;
create policy "Admins can delete submissions"
on public.biography_submissions for delete
to authenticated
using (true);
