/*
  # Comprehensive Security and Performance Fixes

  1. Foreign Key Indexes
    - Add missing indexes: public_links.resume_version_id (not covered by previous migration)
    
  2. Optimize RLS Policies
    - Replace all remaining auth.uid() calls with (select auth.uid())
    - Affects users, resume_versions, public_links, cover_letters, application_kits tables
    
  3. Unused Indexes
    - Drop unused indexes for performance
    
  4. Function Search Path Fixes
    - Ensure all functions have immutable search_path set
    - Fix handle_new_user with proper search_path
    
  5. Password Security
    - Leaked password detection is a Supabase Auth setting (not SQL)
*/

-- ============================================================================
-- 1. ADD MISSING INDEX FOR public_links.resume_version_id
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_public_links_resume_version_id 
  ON public.public_links(resume_version_id);

-- ============================================================================
-- 2. OPTIMIZE ALL REMAINING RLS POLICIES
-- ============================================================================

-- USERS TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- RESUME_VERSIONS TABLE - OPTIMIZE EXISTING POLICIES
DROP POLICY IF EXISTS "Users can view own versions" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can insert own versions" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can update own versions" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can delete own versions" ON public.resume_versions;

CREATE POLICY "Users can view own versions"
  ON public.resume_versions
  FOR SELECT
  TO authenticated
  USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "Users can insert own versions"
  ON public.resume_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    resume_id IN (SELECT id FROM resumes WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "Users can update own versions"
  ON public.resume_versions
  FOR UPDATE
  TO authenticated
  USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = (select auth.uid()))
  )
  WITH CHECK (
    resume_id IN (SELECT id FROM resumes WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "Users can delete own versions"
  ON public.resume_versions
  FOR DELETE
  TO authenticated
  USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = (select auth.uid()))
  );

-- PUBLIC_LINKS TABLE - OPTIMIZE EXISTING POLICIES
DROP POLICY IF EXISTS "Users can create links for own resumes" ON public.public_links;

CREATE POLICY "Users can create links for own resumes"
  ON public.public_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    resume_version_id IN (
      SELECT rv.id FROM resume_versions rv
      JOIN resumes r ON rv.resume_id = r.id
      WHERE r.user_id = (select auth.uid())
    )
  );

-- COVER_LETTERS TABLE - OPTIMIZE EXISTING POLICIES
DROP POLICY IF EXISTS "Users can view their own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can insert their own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can update their own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can delete their own cover letters" ON public.cover_letters;

CREATE POLICY "Users can view their own cover letters"
  ON public.cover_letters
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own cover letters"
  ON public.cover_letters
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own cover letters"
  ON public.cover_letters
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own cover letters"
  ON public.cover_letters
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- APPLICATION_KITS TABLE - OPTIMIZE EXISTING POLICIES
DROP POLICY IF EXISTS "Users can view their own kits" ON public.application_kits;
DROP POLICY IF EXISTS "Users can insert their own kits" ON public.application_kits;
DROP POLICY IF EXISTS "Users can update their own kits" ON public.application_kits;
DROP POLICY IF EXISTS "Users can delete their own kits" ON public.application_kits;

CREATE POLICY "Users can view their own kits"
  ON public.application_kits
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own kits"
  ON public.application_kits
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own kits"
  ON public.application_kits
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own kits"
  ON public.application_kits
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_resume_versions_resume_id;
DROP INDEX IF EXISTS idx_public_links_path;
DROP INDEX IF EXISTS idx_users_stripe_customer;

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATHS - ENSURE IMMUTABLE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, trial_started_at, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.created_at,
    NOW(),
    'trialing'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Security and Performance Fixes Applied:';
  RAISE NOTICE '✓ Added missing foreign key index: public_links.resume_version_id';
  RAISE NOTICE '✓ Optimized RLS policies with (select auth.uid())';
  RAISE NOTICE '✓ Dropped 3 unused indexes';
  RAISE NOTICE '✓ Fixed function search paths with SET search_path';
  RAISE NOTICE '✓ Password protection: Enable in Supabase Auth settings';
END $$;
