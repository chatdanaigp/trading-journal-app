-- Add public profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
