-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ARCHETYPES (KRETS Definition)
create type archetype_enum as enum (
  'THE_BRUTALIST',  -- Function, structure, honesty. Pairs with Modernist.
  'THE_EPICUREAN',  -- Sensory, taste, presence. Pairs with Catalyst.
  'THE_CATALYST',   -- Energy, novelty, connection. (ANCHOR)
  'THE_OBSERVER',   -- Insight, listening, depth. (Max 2 per table)
  'THE_MODERNIST'   -- Systems, future, clarity. (ANCHOR)
);

-- 2. USERS (KRETS Profile)
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text, -- From Google Profile
  personal_number_hash text, -- Nullable (BankID legacy)
  district text check (district in ('Vasastan', 'Södermalm', 'Östermalm', 'Kungsholmen')),
  
  -- The "Social Identity"
  primary_archetype archetype_enum,
  archetype_scores jsonb, -- e.g., {"THE_BRUTALIST": 8, "THE_OBSERVER": 2} for tie-breaking
  
  -- Status
  is_active_for_week boolean default false, -- Set to TRUE when Swish 100 SEK is received
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CLUSTERS (The Tables)
create table public.clusters (
  id uuid primary key default uuid_generate_v4(),
  status text default 'FORMING' check (status in ('FORMING', 'CONFIRMED', 'COMPLETED')),
  week_date date not null,
  district text not null,
  restaurant_name text,
  restaurant_location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.cluster_members (
  cluster_id uuid references public.clusters(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text, -- 'ANCHOR', 'AESTHETIC', 'WILDCARD' (Debugging/Explanation)
  primary key (cluster_id, user_id)
);

-- 4. THE DIAMOND MATCH ALGORITHM (Postgres Function)
-- Usage: SELECT match_krets('Vasastan');
CREATE OR REPLACE FUNCTION match_krets(target_district TEXT) RETURNS INT AS $$
DECLARE
    -- Variables for candidate selection
    anchor_rec RECORD;
    aesthetic_1_rec RECORD;
    aesthetic_2_rec RECORD;
    wildcard_rec RECORD;
    
    new_cluster_id UUID;
    matches_created INT := 0;
    
    -- Constraint Check Helpers
    observer_count INT;
BEGIN
    -- Loop through available ANCHORS (Modernist or Catalyst) first
    FOR anchor_rec IN 
        SELECT * FROM users 
        WHERE district = target_district 
          AND is_active_for_week = true 
          AND primary_archetype IN ('THE_MODERNIST', 'THE_CATALYST')
          AND id NOT IN (SELECT user_id FROM cluster_members) -- Not already matched
    LOOP
        observer_count := 0;
        
        -- A. Determine Aesthetic Target based on Anchor
        -- Modernist (Anchor) -> seeks Brutalist
        -- Catalyst (Anchor) -> seeks Epicurean
        -- (Ideally we'd use a variable, but let's just prioritize matching types)
        
        -- B. Find Slot 2 (Aesthetic Match)
        SELECT * INTO aesthetic_1_rec FROM users
        WHERE district = target_district
          AND is_active_for_week = true
          AND id NOT IN (SELECT user_id FROM cluster_members)
          AND id != anchor_rec.id
          AND (
            (anchor_rec.primary_archetype = 'THE_MODERNIST' AND primary_archetype = 'THE_BRUTALIST') OR
            (anchor_rec.primary_archetype = 'THE_CATALYST' AND primary_archetype = 'THE_EPICUREAN') OR
            -- Fallback: Pair compatible energies if perfect match not found
            (anchor_rec.primary_archetype = 'THE_MODERNIST' AND primary_archetype = 'THE_MODERNIST') OR
            (anchor_rec.primary_archetype = 'THE_CATALYST' AND primary_archetype = 'THE_CATALYST')
          )
        LIMIT 1;
        
        IF aesthetic_1_rec.id IS NULL THEN
           CONTINUE; -- Cannot satisfy Aesthetic Lock, skip this Anchor for now
        END IF;

        -- C. Find Slot 3 (Secondary Aesthetic or Complement)
        SELECT * INTO aesthetic_2_rec FROM users
        WHERE district = target_district
          AND is_active_for_week = true
          AND id NOT IN (SELECT user_id FROM cluster_members)
          AND id NOT IN (anchor_rec.id, aesthetic_1_rec.id)
          -- Ideally not an Observer yet, to save room for Wildcard
          AND primary_archetype != 'THE_OBSERVER' 
        LIMIT 1;

        IF aesthetic_2_rec.id IS NULL THEN
           CONTINUE; 
        END IF;

        -- D. Find Slot 4 (Wildcard - The Texture Rule)
        -- Must ensure total Observers <= 2.
        -- Check current count
        IF anchor_rec.primary_archetype = 'THE_OBSERVER' THEN observer_count := observer_count + 1; END IF;
        IF aesthetic_1_rec.primary_archetype = 'THE_OBSERVER' THEN observer_count := observer_count + 1; END IF;
        IF aesthetic_2_rec.primary_archetype = 'THE_OBSERVER' THEN observer_count := observer_count + 1; END IF;

        SELECT * INTO wildcard_rec FROM users
        WHERE district = target_district
          AND is_active_for_week = true
          AND id NOT IN (SELECT user_id FROM cluster_members)
          AND id NOT IN (anchor_rec.id, aesthetic_1_rec.id, aesthetic_2_rec.id)
          AND (
             primary_archetype != 'THE_OBSERVER' 
             OR (primary_archetype = 'THE_OBSERVER' AND observer_count < 2)
          )
        LIMIT 1;

        IF wildcard_rec.id IS NOT NULL THEN
            -- E. COMMIT THE MATCH
            INSERT INTO clusters (district, week_date, status)
            VALUES (target_district, CURRENT_DATE, 'CONFIRMED')
            RETURNING id INTO new_cluster_id;
            
            INSERT INTO cluster_members (cluster_id, user_id, role) VALUES
            (new_cluster_id, anchor_rec.id, 'ANCHOR'),
            (new_cluster_id, aesthetic_1_rec.id, 'AESTHETIC_LOCK'),
            (new_cluster_id, aesthetic_2_rec.id, 'COMPLEMENT'),
            (new_cluster_id, wildcard_rec.id, 'WILDCARD');
            
            matches_created := matches_created + 1;
        END IF;
        
    END LOOP;
    
    RETURN matches_created;
END;
$$ LANGUAGE plpgsql;

-- 5. RLS Policies
alter table public.users enable row level security;
alter table public.clusters enable row level security;
alter table public.cluster_members enable row level security;

create policy "Users manage own profile" on public.users
  for all using (auth.uid() = id);

create policy "Anyone can read confirmed clusters" on public.clusters
  for select using (status = 'CONFIRMED'); -- Simplified for demo
