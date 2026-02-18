-- Add client_id column to profiles table for ConnextFX verification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_id text;

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'client_id';
