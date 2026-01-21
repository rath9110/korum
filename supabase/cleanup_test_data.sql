-- CLEANUP OLD TEST DATA
-- Run this to remove the "Glass & Concrete Table" test data

-- Delete the specific old test cluster
DELETE FROM public.clusters 
WHERE id = 'b0000000-0000-0000-0000-000000000001';

-- Verify what remains
SELECT * FROM public.reservations 
WHERE user_id = auth.uid();
