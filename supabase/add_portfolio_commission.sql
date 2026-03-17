-- Add commission_per_lot column to profiles and portfolios
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_per_lot numeric DEFAULT 0;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS commission_per_lot numeric DEFAULT 0;

-- Update existing rows to have 0 if null
UPDATE profiles SET commission_per_lot = 0 WHERE commission_per_lot IS NULL;
UPDATE portfolios SET commission_per_lot = 0 WHERE commission_per_lot IS NULL;
