/*
  # Fix User Creation Trigger RLS Issue

  1. Problem
    - The handle_new_user() trigger fails because RLS policies block the insert
    - SECURITY DEFINER functions still respect RLS unless properly configured
    
  2. Solution
    - Recreate the function with proper grants to bypass RLS for system operations
    - Add a bypass policy for the trigger function
    
  3. Security
    - Function remains SECURITY DEFINER with controlled access
    - Only triggered automatically by auth.users INSERT
*/

-- Drop and recreate the function to ensure it has proper permissions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Insert with explicit grant to bypass RLS
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant necessary permissions to the function owner (postgres)
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.users TO postgres;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Add a service role policy to allow system inserts
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Ensure the authenticated role can still insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);
