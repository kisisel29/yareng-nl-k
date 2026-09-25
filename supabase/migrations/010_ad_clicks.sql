-- Reklam tıklama raporları (günlük, reklam başına)
-- SQL Editor'de 007_site_traffic.sql sonrası çalıştırın.

create table if not exists public.ad_clicks_daily (
  day date not null,
  ad_id text not null,
  slot text not null,
  label text not null default '',
  clicks integer not null default 0 check (clicks >= 0),
  primary key (day, ad_id)
);

create index if not exists ad_clicks_daily_day_desc_idx
  on public.ad_clicks_daily (day desc);

create index if not exists ad_clicks_daily_slot_idx
  on public.ad_clicks_daily (slot);

alter table public.ad_clicks_daily enable row level security;

drop policy if exists "Admins can read ad clicks" on public.ad_clicks_daily;
create policy "Admins can read ad clicks"
on public.ad_clicks_daily for select
to authenticated
using (true);

create or replace function public.record_ad_click(
  p_ad_id text,
  p_slot text,
  p_label text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (timezone('Europe/Istanbul', now()))::date;
  v_ad_id text := left(trim(coalesce(p_ad_id, '')), 80);
  v_slot text := left(trim(coalesce(p_slot, '')), 40);
  v_label text := left(trim(coalesce(p_label, '')), 160);
begin
  if v_ad_id = '' or v_slot = '' then
    raise exception 'invalid ad click';
  end if;

  insert into public.ad_clicks_daily (day, ad_id, slot, label, clicks)
  values (v_day, v_ad_id, v_slot, v_label, 1)
  on conflict (day, ad_id) do update
  set
    clicks = public.ad_clicks_daily.clicks + 1,
    slot = excluded.slot,
    label = case
      when excluded.label <> '' then excluded.label
      else public.ad_clicks_daily.label
    end;
end;
$$;

grant execute on function public.record_ad_click(text, text, text) to anon, authenticated;
