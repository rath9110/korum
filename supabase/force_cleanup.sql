-- FORCE CLEANUP BY NAME
-- Run this to remove the specific "Glass & Concrete Table" cluster regardless of ID

DELETE FROM public.clusters 
WHERE restaurant_name = 'The Glass & Concrete Table';

-- Also ensure the Correct Cluster exists
SELECT id, restaurant_name, status, dinner_date 
FROM public.clusters 
WHERE restaurant_name = 'KRETS ASSEMBLY HALL';
