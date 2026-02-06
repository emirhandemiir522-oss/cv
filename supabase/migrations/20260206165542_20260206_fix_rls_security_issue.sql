/*
  # Fix RLS Security Issue - Remove Insecure Policy

  1. Problem
    - Previous migration created an insecure policy allowing anyone to insert users
    
  2. Solution
    - Remove the insecure "Service role can insert users" policy
    - Keep only the secure user-specific policy
    - The SECURITY DEFINER function should handle system inserts
*/

-- Remove the insecure policy
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Verify that only the secure policy exists
-- The SECURITY DEFINER function with proper grants should bypass RLS automatically
