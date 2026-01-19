-- Create Test Reservation for Upcoming Reservation Module
-- Run this in Supabase SQL Editor after the main schema

-- First, create a test cluster for next Wednesday at 20:00
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
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'CONFIRMED',
  (CURRENT_DATE + INTERVAL '3 days')::date, -- Adjust to next Wednesday
  'Vasastan',
  'The Glass & Concrete Table',
  'Odengatan 45, Stockholm',
  (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '20 hours')::timestamp with time zone, -- Wednesday 20:00
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400'
) ON CONFLICT (id) DO UPDATE SET
  dinner_date = EXCLUDED.dinner_date,
  restaurant_name = EXCLUDED.restaurant_name;

-- Create a reservation for your user
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- You can find it by running: SELECT id FROM auth.users WHERE email = 'your-email@gmail.com';

INSERT INTO public.reservations (
  user_id,
  cluster_id,
  dinner_event_id,
  status
) VALUES (
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1), -- Gets most recent user (you)
  'b0000000-0000-0000-0000-000000000001'::uuid,
  '1', -- Matches DINNER_EVENTS[0].id from DinnerSelection.tsx
  'CONFIRMED'
) ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 
  r.status as reservation_status,
  c.restaurant_name,
  c.dinner_date,
  c.district,
  u.full_name
FROM reservations r
JOIN clusters c ON r.cluster_id = c.id
JOIN users u ON r.user_id = u.id
WHERE r.status = 'CONFIRMED'
ORDER BY c.dinner_date ASC;
