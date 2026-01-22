-- Check what reservations the user has
SELECT 
    r.id, 
    r.status, 
    c.restaurant_name, 
    c.dinner_date,
    now() as current_time
FROM reservations r
JOIN clusters c ON r.cluster_id = c.id
ORDER BY c.dinner_date ASC;
