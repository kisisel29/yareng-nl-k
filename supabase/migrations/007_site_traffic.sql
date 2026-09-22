-- Site trafiği (günlük ziyaret / tıklama)
-- SQL Editor'de çalıştırın.

create table if not exists public.site_traffic_daily (
  day date primary key,
  visits integer not null default 0 check (visits >= 0),
  clicks integer not null default 0 check (clicks >= 0)
);

create index if not exists site_traffic_daily_day_desc_idx
  on public.site_traffic_daily (day desc);

alter table public.site_traffic_daily enable row level security;

drop policy if exists "Admins can read site traffic" on public.site_traffic_daily;
create policy "Admins can read site traffic"
on public.site_traffic_daily for select
to authenticated
using (true);

create or replace function public.record_site_traffic(p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (timezone('Europe/Istanbul', now()))::date;
begin
  if p_kind is distinct from 'visit' and p_kind is distinct from 'click' then
    raise exception 'invalid kind';
  end if;

  insert into public.site_traffic_daily (day, visits, clicks)
  values (
    v_day,
    case when p_kind = 'visit' then 1 else 0 end,
    case when p_kind = 'click' then 1 else 0 end
  )
  on conflict (day) do update
  set
    visits = public.site_traffic_daily.visits + case when p_kind = 'visit' then 1 else 0 end,
    clicks = public.site_traffic_daily.clicks + case when p_kind = 'click' then 1 else 0 end;
end;
$$;

grant execute on function public.record_site_traffic(text) to anon, authenticated;
