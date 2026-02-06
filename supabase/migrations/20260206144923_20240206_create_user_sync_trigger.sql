/*
  # Create User Sync Trigger

  1. Changes
    - Create a trigger function to automatically create public.users row when auth.users is created
    - This ensures new signups automatically get a public.users record

  2. Security
    - Function runs with SECURITY DEFINER to access auth schema
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();