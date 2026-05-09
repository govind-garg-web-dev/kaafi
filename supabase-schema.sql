-- ============================================================
-- Kaafi Phase 1 Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ───────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  plan          text not null default 'hobby' check (plan in ('hobby', 'builder', 'studio')),
  credits_balance integer not null default 30,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Projects ───────────────────────────────────────────────
create table public.projects (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  prompt        text not null,
  mcq_answers   jsonb not null default '{}',
  status        text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'error')),
  scaffold_type text not null default 'auth-feed',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can CRUD own projects"
  on public.projects for all using (auth.uid() = user_id);

-- ── Project files ───────────────────────────────────────────
create table public.project_files (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  path          text not null,
  content       text not null,
  updated_at    timestamptz not null default now(),
  unique (project_id, path)
);

alter table public.project_files enable row level security;

create policy "Users can CRUD own project files"
  on public.project_files for all
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  ));

-- ── Credit transactions ─────────────────────────────────────
create table public.credit_transactions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  delta         integer not null,
  reason        text not null,
  project_id    uuid references public.projects(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table public.credit_transactions enable row level security;

create policy "Users can read own transactions"
  on public.credit_transactions for select using (auth.uid() = user_id);

create policy "Service role can insert transactions"
  on public.credit_transactions for insert with check (true);

-- ── Builds ──────────────────────────────────────────────
-- Run this block separately if you already ran the initial schema
create table public.builds (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  platform      text not null default 'android' check (platform in ('android', 'ios')),
  status        text not null default 'queued' check (status in ('queued', 'building', 'finished', 'errored')),
  eas_build_id  text,
  download_url  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.builds enable row level security;

create policy "Users can CRUD own builds"
  on public.builds for all using (auth.uid() = user_id);
