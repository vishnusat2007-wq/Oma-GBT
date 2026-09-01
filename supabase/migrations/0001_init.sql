-- OmaGBT initial schema
-- One parent account (auth.users) owns one or more child profiles.
-- All child-owned data is protected by Row Level Security so a parent can only
-- ever read/write rows belonging to their own child profiles.

create extension if not exists "pgcrypto";

-- =========================================================================
-- Core ownership tables
-- =========================================================================

create table if not exists parent_accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists parent_settings (
  parent_id uuid primary key references parent_accounts (id) on delete cascade,
  pin_hash text not null,
  emergency_online_disable boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parent_accounts (id) on delete cascade,
  display_name text not null check (char_length(display_name) <= 40),
  age_range text not null default '7-8' check (age_range in ('5-6','7-8','9-10','11-12')),
  companion jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_child_profiles_parent on child_profiles (parent_id);

-- =========================================================================
-- Child-owned content
-- =========================================================================

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  title text not null default 'New chat',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_conversations_child on conversations (child_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  kind text not null default 'text',
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_conversation on messages (conversation_id);

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  key text not null,
  value text not null,
  category text not null default 'other' check (category in ('favorite','hobby','character','learning','other')),
  source text not null default 'child' check (source in ('child','companion')),
  created_at timestamptz not null default now()
);
create index if not exists idx_memories_child on memories (child_id);

create table if not exists saved_stories (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  title text not null,
  characters jsonb not null default '[]'::jsonb,
  setting text not null default '',
  mood text not null default 'cozy',
  pages jsonb not null default '[]'::jsonb,
  favorite boolean not null default false,
  complete boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_saved_stories_child on saved_stories (child_id);

create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  game text not null,
  score integer not null default 0,
  difficulty text,
  result text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_game_sessions_child on game_sessions (child_id);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  key text not null,
  unlocked_at timestamptz not null default now(),
  unique (child_id, key)
);
create index if not exists idx_achievements_child on achievements (child_id);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  title text not null,
  when_text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_reminders_child on reminders (child_id);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_notes_child on notes (child_id);

create table if not exists feature_permissions (
  child_id uuid primary key references child_profiles (id) on delete cascade,
  chat boolean not null default true,
  arcade boolean not null default true,
  magic boolean not null default true,
  stories boolean not null default true,
  learn boolean not null default true,
  online_tools boolean not null default true
);

create table if not exists approved_websites (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_approved_websites_child on approved_websites (child_id);

create table if not exists tool_approval_requests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  tool text not null,
  summary text not null,
  args jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','denied','completed')),
  requires_approval boolean not null default true,
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists idx_tool_requests_child on tool_approval_requests (child_id);

create table if not exists tool_audit_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  tool text not null,
  summary text not null,
  outcome text not null,
  required_approval boolean not null default false,
  at timestamptz not null default now()
);
create index if not exists idx_tool_audit_child on tool_audit_events (child_id);

create table if not exists safety_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child_profiles (id) on delete cascade,
  category text not null,
  action text not null,
  at timestamptz not null default now()
);
create index if not exists idx_safety_events_child on safety_events (child_id);

create table if not exists app_preferences (
  child_id uuid primary key references child_profiles (id) on delete cascade,
  sound_on boolean not null default true,
  tts_on boolean not null default false,
  reduced_motion boolean not null default false,
  daily_limit_minutes integer not null default 45,
  quiet_hours jsonb not null default '{"enabled":true,"start":"20:30","end":"07:00"}'::jsonb,
  retention_days integer not null default 90,
  online_tools_master_switch boolean not null default true
);

-- =========================================================================
-- Row Level Security
-- =========================================================================

-- Helper: does the current user own this child profile?
create or replace function public.owns_child(target_child uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from child_profiles c
    where c.id = target_child and c.parent_id = auth.uid()
  );
$$;

alter table parent_accounts enable row level security;
alter table parent_settings enable row level security;
alter table child_profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table memories enable row level security;
alter table saved_stories enable row level security;
alter table game_sessions enable row level security;
alter table achievements enable row level security;
alter table reminders enable row level security;
alter table notes enable row level security;
alter table feature_permissions enable row level security;
alter table approved_websites enable row level security;
alter table tool_approval_requests enable row level security;
alter table tool_audit_events enable row level security;
alter table safety_events enable row level security;
alter table app_preferences enable row level security;

-- Parent-owned tables
create policy "own parent account" on parent_accounts
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own parent settings" on parent_settings
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "own child profiles" on child_profiles
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Child-owned tables (via owns_child)
create policy "own memories" on memories
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own conversations" on conversations
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own saved stories" on saved_stories
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own game sessions" on game_sessions
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own achievements" on achievements
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own reminders" on reminders
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own notes" on notes
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own feature permissions" on feature_permissions
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own approved websites" on approved_websites
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own tool requests" on tool_approval_requests
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own tool audit" on tool_audit_events
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own safety events" on safety_events
  for all using (owns_child(child_id)) with check (owns_child(child_id));
create policy "own app preferences" on app_preferences
  for all using (owns_child(child_id)) with check (owns_child(child_id));

-- Messages are owned via their conversation's child.
create policy "own messages" on messages
  for all
  using (
    exists (
      select 1 from conversations conv
      where conv.id = messages.conversation_id and owns_child(conv.child_id)
    )
  )
  with check (
    exists (
      select 1 from conversations conv
      where conv.id = messages.conversation_id and owns_child(conv.child_id)
    )
  );

-- New parent auth users get a parent_accounts row automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.parent_accounts (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
