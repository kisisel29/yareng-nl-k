-- Yorum onay sistemi
-- SQL Editor'de 008_content_comments.sql sonrası çalıştırın.

create or replace function public.add_content_comment(
  p_key text,
  p_name text,
  p_body text,
  p_a integer,
  p_b integer,
  p_answer integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  raw text;
  tree jsonb;
  list jsonb;
  cleaned_name text;
  cleaned_body text;
  entry jsonb;
begin
  if p_key is null or length(trim(p_key)) < 3 or length(p_key) > 180 then
    raise exception 'invalid key';
  end if;
  if p_a is null or p_b is null or p_answer is null then
    raise exception 'invalid captcha';
  end if;
  if p_a < 1 or p_a > 20 or p_b < 1 or p_b > 20 then
    raise exception 'invalid captcha';
  end if;
  if p_answer <> (p_a + p_b) then
    raise exception 'captcha failed';
  end if;

  cleaned_name := trim(coalesce(p_name, ''));
  cleaned_body := trim(coalesce(p_body, ''));

  if length(cleaned_name) < 2 or length(cleaned_name) > 60 then
    raise exception 'invalid name';
  end if;
  if length(cleaned_body) < 3 or length(cleaned_body) > 500 then
    raise exception 'invalid body';
  end if;

  select value into raw from public.site_settings where key = 'content_comments';
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

  list := coalesce(tree -> p_key, '[]'::jsonb);
  if jsonb_typeof(list) <> 'array' then
    list := '[]'::jsonb;
  end if;

  entry := jsonb_build_object(
    'id', gen_random_uuid()::text,
    'name', cleaned_name,
    'body', cleaned_body,
    'status', 'pending',
    'created_at', to_char(now() at time zone 'Europe/Istanbul', 'YYYY-MM-DD"T"HH24:MI:SSOF')
  );

  list := jsonb_build_array(entry) || list;
  if jsonb_array_length(list) > 200 then
    list := (
      select jsonb_agg(value)
      from (
        select value
        from jsonb_array_elements(list) with ordinality as t(value, ord)
        where ord <= 200
      ) limited
    );
  end if;

  tree := jsonb_set(tree, array[p_key], list);

  insert into public.site_settings (key, value)
  values ('content_comments', tree::text)
  on conflict (key) do update set value = excluded.value;

  return entry;
end;
$$;

create or replace function public.moderate_content_comment(
  p_key text,
  p_id text,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  raw text;
  tree jsonb;
  list jsonb;
  next_list jsonb := '[]'::jsonb;
  item jsonb;
  found boolean := false;
begin
  if auth.role() is distinct from 'authenticated' then
    raise exception 'forbidden';
  end if;
  if p_key is null or length(trim(p_key)) < 3 or length(p_key) > 180 then
    raise exception 'invalid key';
  end if;
  if p_id is null or length(trim(p_id)) < 8 then
    raise exception 'invalid id';
  end if;
  if p_action is distinct from 'approve'
     and p_action is distinct from 'reject'
     and p_action is distinct from 'delete' then
    raise exception 'invalid action';
  end if;

  select value into raw from public.site_settings where key = 'content_comments';
  if raw is null or raw = '' then
    raise exception 'not found';
  end if;

  begin
    tree := raw::jsonb;
  exception
    when others then
      raise exception 'not found';
  end;

  list := coalesce(tree -> p_key, '[]'::jsonb);
  if jsonb_typeof(list) <> 'array' then
    raise exception 'not found';
  end if;

  for item in select value from jsonb_array_elements(list)
  loop
    if item ->> 'id' = p_id then
      found := true;
      if p_action = 'delete' then
        continue;
      elsif p_action = 'approve' then
        item := jsonb_set(item, '{status}', '"approved"');
      else
        item := jsonb_set(item, '{status}', '"rejected"');
      end if;
    end if;
    next_list := next_list || jsonb_build_array(item);
  end loop;

  if not found then
    raise exception 'not found';
  end if;

  tree := jsonb_set(tree, array[p_key], next_list);

  insert into public.site_settings (key, value)
  values ('content_comments', tree::text)
  on conflict (key) do update set value = excluded.value;

  return jsonb_build_object('ok', true, 'action', p_action, 'id', p_id);
end;
$$;

grant execute on function public.add_content_comment(text, text, text, integer, integer, integer) to anon, authenticated;
grant execute on function public.moderate_content_comment(text, text, text) to authenticated;
