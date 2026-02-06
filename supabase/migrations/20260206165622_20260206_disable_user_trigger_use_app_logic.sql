/*
  # Disable Automatic User Profile Creation Trigger

  1. Problem
    - The automatic trigger was causing "Database error saving new user" errors
    - RLS policies were blocking the trigger from creating user profiles
    
  2. Solution
    - Disable the trigger and let application code handle user profile creation
    - This provides better error handling and more reliable user creation
    - Keep the trigger function for potential future use but don't use it
    
  3. Security
    - RLS policies remain in place
    - User profiles are created explicitly in signup action with proper auth context
*/

-- Disable the trigger (don't drop in case we need it later)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function but document it's not in use
COMMENT ON FUNCTION public.handle_new_user() IS 'Disabled: User profile creation now handled in application code for better error handling';

-- Ensure RLS policies are correct for manual profile creation
-- Users must be able to insert their own profile when authenticated
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);
