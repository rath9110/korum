-- DEBUG: LIST ALL MY RESERVATIONS
-- Run this to see what is actually in the database

SELECT 
  r.id as reservation_id,
  r.status,
  c.id as cluster_id,
  c.restaurant_name,
  c.dinner_date,
  c.district
FROM reservations r
JOIN clusters c ON r.cluster_id = c.id
WHERE r.user_id = auth.uid()
ORDER BY c.dinner_date ASC;
