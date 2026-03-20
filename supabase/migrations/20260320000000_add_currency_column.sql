-- Add currency column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add currency column to portfolios
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
