-- Fix Row-Level Security (RLS) Policies
-- Run this in Supabase SQL Editor to allow authenticated users to create reservations

-- Allow authenticated users to INSERT into clusters table
DROP POLICY IF EXISTS "Users can insert clusters" ON public.clusters;
CREATE POLICY "Users can insert clusters" 
ON public.clusters FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to SELECT from clusters
DROP POLICY IF EXISTS "Users can view clusters" ON public.clusters;
CREATE POLICY "Users can view clusters" 
ON public.clusters FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to INSERT into reservations table
DROP POLICY IF EXISTS "Users can insert reservations" ON public.reservations;
CREATE POLICY "Users can insert reservations" 
ON public.reservations FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Allow users to view their own reservations
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" 
ON public.reservations FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- NEW: Allow users to view reservations of peers in the same cluster
DROP POLICY IF EXISTS "Users can view peer reservations" ON public.reservations;
CREATE POLICY "Users can view peer reservations" 
ON public.reservations FOR SELECT 
TO authenticated 
USING (
  cluster_id IN (
    SELECT cluster_id 
    FROM public.reservations 
    WHERE user_id = auth.uid()
  )
);

-- Verify policies are created
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('clusters', 'reservations');
