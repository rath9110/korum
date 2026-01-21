-- DESTROY ZOMBIE CLUSTER
-- Deleting specific ID provided by user debugging

DELETE FROM public.clusters 
WHERE id = '637f61d8-62e5-48ba-9234-80d7c2719f93';

-- Verify it is gone
SELECT count(*) as cluster_count 
FROM public.clusters 
WHERE id = '637f61d8-62e5-48ba-9234-80d7c2719f93';
