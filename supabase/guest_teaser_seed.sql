-- SEED DATA FOR GUEST LIST TEASER
-- Run this in Supabase SQL Editor

-- 1. DROP RESTRICTIVE FOREIGN KEY (For Testing Only)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 2. Create a Test Cluster (Target: Next Friday)
INSERT INTO public.clusters (
  id,
  status,
  week_date,
  district,
  restaurant_name,
  restaurant_location,
  dinner_date,
  venue_image_url
) VALUES (
  'c1111111-1111-1111-1111-111111111111'::uuid,
  'CONFIRMED',
  (CURRENT_DATE + INTERVAL '5 days')::date,
  'Södermalm',
  'KRETS ASSEMBLY HALL',
  'Götgatan Secret Entry',
  (CURRENT_DATE + INTERVAL '5 days' + INTERVAL '19 hours')::timestamp with time zone,
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400'
) ON CONFLICT (id) DO UPDATE SET
  dinner_date = EXCLUDED.dinner_date;

-- 2. Create Dummy Users (Peers)
-- Note: inserting into auth.users is tricky/restricted; we usually insert into public.users directly if foreign keys allow,
-- BUT public.users references auth.users. 
-- WORKAROUND: For pure UI testing, we will just create rows in public.users linked to arbitrary UUIDs.
-- This works IF there's no strict trigger checking auth.users existence for public.users inserts (rare but possible).

-- Peer 1: The Rebel
INSERT INTO public.users (id, full_name, primary_archetype, social_karma)
VALUES (
  '00000000-0000-0000-0000-111111111111'::uuid,
  'Peer One',
  'THE_CATALYST', -- "Rebel" mapped to Catalyst/Epicurean usually, using Catalyst here
  4.8
) ON CONFLICT (id) DO NOTHING;

-- Peer 2: The Sage
INSERT INTO public.users (id, full_name, primary_archetype, social_karma)
VALUES (
  '00000000-0000-0000-0000-222222222222'::uuid,
  'Peer Two',
  'THE_OBSERVER', -- "Sage" equivalent
  4.2
) ON CONFLICT (id) DO NOTHING;

-- Peer 3: The Brutalist
INSERT INTO public.users (id, full_name, primary_archetype, social_karma)
VALUES (
  '00000000-0000-0000-0000-333333333333'::uuid,
  'Peer Three',
  'THE_BRUTALIST',
  5.0
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Reservations for Peers
INSERT INTO public.reservations (user_id, cluster_id, status, dinner_event_id) VALUES
('00000000-0000-0000-0000-111111111111'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, 'CONFIRMED', '1'),
('00000000-0000-0000-0000-222222222222'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, 'CONFIRMED', '1'),
('00000000-0000-0000-0000-333333333333'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, 'CONFIRMED', '1')
ON CONFLICT DO NOTHING;

-- 4. Assign YOU (The authenticated user) to this cluster
-- We select the most recently created user in public.users who IS NOT one of the dummies
INSERT INTO public.reservations (
  user_id,
  cluster_id,
  dinner_event_id,
  status
)
SELECT 
  id, 
  'c1111111-1111-1111-1111-111111111111'::uuid,
  '1',
  'CONFIRMED'
FROM auth.users
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verification Query
SELECT 
    c.restaurant_name, 
    u.primary_archetype, 
    r.status 
FROM reservations r
JOIN users u ON r.user_id = u.id
JOIN clusters c ON r.cluster_id = c.id
WHERE c.id = 'c1111111-1111-1111-1111-111111111111'::uuid;
