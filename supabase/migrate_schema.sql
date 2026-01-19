-- Migration Script for KRETS Database Updates
-- Run this INSTEAD of the full schema.sql if you already have tables created

-- Add dinner_date and venue_image_url to clusters table
ALTER TABLE public.clusters 
ADD COLUMN IF NOT EXISTS dinner_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS venue_image_url text;

-- Add social_karma and top_vibe_tags to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS social_karma decimal(2,1) default 0.0,
ADD COLUMN IF NOT EXISTS top_vibe_tags jsonb default '[]'::jsonb;

-- Make district nullable in users
ALTER TABLE public.users ALTER COLUMN district DROP NOT NULL;

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  cluster_id uuid references public.clusters(id) on delete cascade,
  dinner_event_id text not null,
  status text default 'PENDING' check (status in ('PENDING', 'CONFIRMED', 'ATTENDED', 'CANCELLED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'clusters' AND column_name IN ('dinner_date', 'venue_image_url');

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('social_karma', 'top_vibe_tags', 'district');
