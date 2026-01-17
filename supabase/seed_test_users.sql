-- Seed Test Users for KRETS Matching
-- Run this in your Supabase SQL Editor to create test users

-- Note: These users are created directly in the users table
-- In production, they would come from auth.users via Google SSO

-- Test User 1: THE_MODERNIST (Anchor)
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Alex Chen',
  'https://i.pravatar.cc/150?img=1',
  'Vasastan',
  'THE_MODERNIST',
  '{"THE_MODERNIST": 12, "THE_BRUTALIST": 3, "THE_OBSERVER": 2}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 2: THE_BRUTALIST (Pairs with Modernist)
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'Sofia Johansson',
  'https://i.pravatar.cc/150?img=2',
  'Vasastan',
  'THE_BRUTALIST',
  '{"THE_BRUTALIST": 11, "THE_MODERNIST": 4, "THE_OBSERVER": 1}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 3: THE_CATALYST (Anchor)
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000003'::uuid,
  'Marcus Lindgren',
  'https://i.pravatar.cc/150?img=3',
  'Vasastan',
  'THE_CATALYST',
  '{"THE_CATALYST": 13, "THE_EPICUREAN": 3, "THE_OBSERVER": 0}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 4: THE_EPICUREAN (Pairs with Catalyst)
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000004'::uuid,
  'Emma Bergström',
  'https://i.pravatar.cc/150?img=4',
  'Vasastan',
  'THE_EPICUREAN',
  '{"THE_EPICUREAN": 10, "THE_CATALYST": 5, "THE_OBSERVER": 1}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 5: THE_OBSERVER (Wildcard - max 2 per table)
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000005'::uuid,
  'Nina Andersson',
  'https://i.pravatar.cc/150?img=5',
  'Vasastan',
  'THE_OBSERVER',
  '{"THE_OBSERVER": 14, "THE_BRUTALIST": 2, "THE_MODERNIST": 1}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 6: Another THE_MODERNIST (for second match)
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000006'::uuid,
  'Oliver Ström',
  'https://i.pravatar.cc/150?img=6',
  'Vasastan',
  'THE_MODERNIST',
  '{"THE_MODERNIST": 11, "THE_CATALYST": 3, "THE_EPICUREAN": 2}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 7: Another THE_BRUTALIST
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000007'::uuid,
  'Lena Pettersson',
  'https://i.pravatar.cc/150?img=7',
  'Vasastan',
  'THE_BRUTALIST',
  '{"THE_BRUTALIST": 12, "THE_OBSERVER": 3, "THE_MODERNIST": 1}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 8: Another THE_EPICUREAN
INSERT INTO public.users (
  id, 
  full_name, 
  avatar_url,
  district, 
  primary_archetype, 
  archetype_scores,
  is_active_for_week
) VALUES (
  'a0000000-0000-0000-0000-000000000008'::uuid,
  'Viktor Larsson',
  'https://i.pravatar.cc/150?img=8',
  'Vasastan',
  'THE_EPICUREAN',
  '{"THE_EPICUREAN": 13, "THE_CATALYST": 2, "THE_OBSERVER": 2}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 
  full_name,
  district,
  primary_archetype,
  is_active_for_week
FROM public.users
ORDER BY created_at DESC;
