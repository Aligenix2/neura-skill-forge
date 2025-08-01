-- Fix Critical Security Issues

-- 1. Add missing DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Check and fix the profile creation trigger
-- First, ensure the trigger exists and is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill missing profiles for existing users (if any)
INSERT INTO public.profiles (user_id, username)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'username', split_part(au.email, '@', 1))
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;