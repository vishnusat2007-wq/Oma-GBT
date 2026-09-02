-- Cloud memory for the private OmaGBT household.
-- Tables are RLS-locked (no anon/authenticated policies). The Next.js server
-- calls security-definer RPCs with a household secret (never shipped to the browser).

create extension if not exists pgcrypto;

create table if not exists public.household_auth (
  household_id text primary key,
  secret_hash text not null
);

create table if not exists public.family_snapshots (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.cloud_memories (
  id text primary key,
  household_id text not null,
  key text not null,
  value text not null,
  category text not null default 'other',
  source text not null default 'child',
  created_at timestamptz not null default now()
);

create index if not exists cloud_memories_household_idx
  on public.cloud_memories (household_id);

alter table public.household_auth enable row level security;
alter table public.family_snapshots enable row level security;
alter table public.cloud_memories enable row level security;

revoke all on table public.household_auth from anon, authenticated, public;
revoke all on table public.family_snapshots from anon, authenticated, public;
revoke all on table public.cloud_memories from anon, authenticated, public;

create or replace function public.omagbt_household_id(p_secret text)
returns text
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  hid text;
begin
  if p_secret is null or length(p_secret) < 16 then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  select household_id into hid
  from public.household_auth
  where secret_hash = encode(digest(convert_to(p_secret, 'UTF8'), 'sha256'), 'hex')
  limit 1;
  if hid is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  return hid;
end;
$$;

create or replace function public.omagbt_load(p_secret text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  hid text;
  snap jsonb;
  ts timestamptz;
  mem_count integer;
begin
  hid := public.omagbt_household_id(p_secret);
  select payload, updated_at into snap, ts
  from public.family_snapshots
  where id = hid;
  select count(*) into mem_count
  from public.cloud_memories
  where household_id = hid;
  return jsonb_build_object(
    'householdId', hid,
    'payload', snap,
    'updatedAt', ts,
    'memoryCount', coalesce(mem_count, 0)
  );
end;
$$;

create or replace function public.omagbt_save(p_secret text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  hid text;
  mem jsonb;
  mem_id text;
begin
  hid := public.omagbt_household_id(p_secret);
  insert into public.family_snapshots (id, payload, updated_at)
  values (hid, coalesce(p_payload, '{}'::jsonb), now())
  on conflict (id) do update
    set payload = excluded.payload,
        updated_at = now();

  delete from public.cloud_memories where household_id = hid;

  for mem in
    select value from jsonb_array_elements(coalesce(p_payload->'memories', '[]'::jsonb))
  loop
    mem_id := coalesce(nullif(mem->>'id', ''), gen_random_uuid()::text);
    insert into public.cloud_memories (id, household_id, key, value, category, source, created_at)
    values (
      mem_id,
      hid,
      left(coalesce(mem->>'key', 'memory'), 80),
      left(coalesce(mem->>'value', ''), 400),
      coalesce(mem->>'category', 'other'),
      coalesce(mem->>'source', 'child'),
      coalesce((mem->>'createdAt')::timestamptz, now())
    )
    on conflict (id) do update set
      key = excluded.key,
      value = excluded.value,
      category = excluded.category,
      source = excluded.source,
      created_at = excluded.created_at;
  end loop;

  return jsonb_build_object('ok', true, 'updatedAt', now());
end;
$$;

create or replace function public.omagbt_wipe(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  hid text;
begin
  hid := public.omagbt_household_id(p_secret);
  delete from public.cloud_memories where household_id = hid;
  delete from public.family_snapshots where id = hid;
  return jsonb_build_object('ok', true, 'householdId', hid);
end;
$$;

revoke all on function public.omagbt_household_id(text) from public, anon, authenticated;
grant execute on function public.omagbt_load(text) to anon, authenticated, service_role;
grant execute on function public.omagbt_save(text, jsonb) to anon, authenticated, service_role;
grant execute on function public.omagbt_wipe(text) to anon, authenticated, service_role;
