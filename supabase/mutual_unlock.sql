-- 1. Add Social Columns to Users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS linkedin_handle TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- 2. Create User Feedback Table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Context (Optional but recommended)
  cluster_id UUID REFERENCES public.clusters(id) ON DELETE SET NULL, 
  
  is_positive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent duplicate feedback for the same pair
  UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS on Feedback
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only create feedback from themselves
CREATE POLICY "Users can create their own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Policy: Users can view feedback they created
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = from_user_id);

-- 3. The Mutual Unlock Check Function
CREATE OR REPLACE FUNCTION check_mutual_unlock(user_a UUID, user_b UUID) 
RETURNS BOOLEAN SECURITY DEFINER AS $$
DECLARE
    ab_positive BOOLEAN;
    ba_positive BOOLEAN;
BEGIN
    -- Check if A likes B
    SELECT is_positive INTO ab_positive
    FROM user_feedback
    WHERE from_user_id = user_a AND to_user_id = user_b;

    -- Check if B likes A
    SELECT is_positive INTO ba_positive
    FROM user_feedback
    WHERE from_user_id = user_b AND to_user_id = user_a;

    -- Return TRUE only if BOTH are true
    RETURN COALESCE(ab_positive, FALSE) AND COALESCE(ba_positive, FALSE);
END;
$$ LANGUAGE plpgsql;

-- 4. Secure Profile Access (Update Users RLS)
-- We need to ensure that 'full_name', 'linkedin_handle', 'instagram_handle' 
-- are only visible if check_mutual_unlock(requesting_user, target_user) is TRUE.
-- NOTE: Postgres RLS applies to ROWS, not COLUMNS directly. 
-- To achieve column-level security, we typically use a View or a Function, 
-- or split the private data into a separate table 'user_private_details'.
--
-- For Simplicity in this MVP: We will create a secure VIEW that exposes the data conditionally.

CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT 
  u.id,
  u.avatar_url,
  u.primary_archetype,
  u.social_karma,
  u.top_vibe_tags,
  -- Conditionally reveal private fields
  CASE 
    WHEN (auth.uid() = u.id) OR (check_mutual_unlock(auth.uid(), u.id)) THEN u.full_name
    ELSE NULL 
  END AS full_name,
  CASE 
    WHEN (auth.uid() = u.id) OR (check_mutual_unlock(auth.uid(), u.id)) THEN u.linkedin_handle
    ELSE NULL 
  END AS linkedin_handle,
  CASE 
    WHEN (auth.uid() = u.id) OR (check_mutual_unlock(auth.uid(), u.id)) THEN u.instagram_handle
    ELSE NULL 
  END AS instagram_handle
FROM public.users u;

-- Grant access to the view
GRANT SELECT ON public.user_profiles_view TO authenticated;
