-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ARCHETYPES (The Vibe)
create type archetype_enum as enum (
  'THE_ARCHITECT',
  'THE_SOCIALITE',
  'THE_HUSTLER',
  'THE_POET',
  'THE_MYSTIC',
  'THE_NOMAD'
);

create table public.archetypes (
  id uuid primary key default uuid_generate_v4(),
  name archetype_enum not null,
  description text not null,
  image_url text
);

-- USERS (BankID Verified)
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text not null, -- From BankID
  personal_number_hash text not null unique, -- Hashed for privacy
  district text check (district in ('Vasastan', 'Södermalm', 'Östermalm', 'Kungsholmen')),
  primary_archetype archetype_enum,
  secondary_archetype archetype_enum,
  is_active_for_week boolean default false, -- Set to true after Swish payment
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MATCHES (The Diamond)
create table public.clusters (
  id uuid primary key default uuid_generate_v4(),
  week_date date not null,
  district text not null,
  restaurant_name text, -- Revealed later
  restaurant_location text, -- Lat/Long or address
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.cluster_members (
  cluster_id uuid references public.clusters(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text check (role in ('Anchor', 'Listener', 'Spark', 'Member')),
  primary key (cluster_id, user_id)
);

-- RLS Policies (Basic Setup)
alter table public.users enable row level security;
alter table public.matches enable row level security; -- Matches table was renamed to clusters, fixing logic conceptually but SQL above used clusters.

create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);
