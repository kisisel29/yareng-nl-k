-- Köşe yazısı tepkileri (site_settings JSON)
-- SQL Editor'de çalıştırın.

create or replace function public.react_to_content(
  p_key text,
  p_reaction text,
  p_previous text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  raw text;
  tree jsonb;
  counts jsonb;
  allowed text[] := array['love', 'dislike', 'laugh', 'sad', 'angry', 'wow'];
begin
  if p_key is null or length(trim(p_key)) < 3 or length(p_key) > 180 then
    raise exception 'invalid key';
  end if;
  if not (p_reaction = any (allowed)) then
    raise exception 'invalid reaction';
  end if;
  if p_previous is not null and p_previous <> '' and not (p_previous = any (allowed)) then
    raise exception 'invalid previous';
  end if;

  select value into raw from public.site_settings where key = 'content_reactions';
  if raw is null or raw = '' then
    tree := '{}'::jsonb;
  else
    begin
      tree := raw::jsonb;
    exception
      when others then
        tree := '{}'::jsonb;
    end;
  end if;

  counts := coalesce(tree -> p_key, '{}'::jsonb);

  if p_previous is not null and p_previous <> '' and p_previous = p_reaction then
    counts := jsonb_set(
      counts,
      array[p_reaction],
      to_jsonb(greatest(0, coalesce((counts ->> p_reaction)::int, 0) - 1))
    );
  else
    if p_previous is not null and p_previous <> '' and p_previous <> p_reaction then
      counts := jsonb_set(
        counts,
        array[p_previous],
        to_jsonb(greatest(0, coalesce((counts ->> p_previous)::int, 0) - 1))
      );
    end if;
    counts := jsonb_set(
      counts,
      array[p_reaction],
      to_jsonb(coalesce((counts ->> p_reaction)::int, 0) + 1)
    );
  end if;

  tree := jsonb_set(tree, array[p_key], counts);

  insert into public.site_settings (key, value)
  values ('content_reactions', tree::text)
  on conflict (key) do update set value = excluded.value;

  return counts;
end;
$$;

grant execute on function public.react_to_content(text, text, text) to anon, authenticated;
