-- 1. Fix Profiles Table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS port_size numeric DEFAULT 1000,
ADD COLUMN IF NOT EXISTS profit_goal_percent numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS commission_per_lot numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 2. Fix Portfolios Table
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS port_size numeric DEFAULT 1000,
ADD COLUMN IF NOT EXISTS profit_goal_percent numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS commission_per_lot numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 3. Update existing NULL values to defaults
UPDATE profiles SET port_size = 1000 WHERE port_size IS NULL;
UPDATE profiles SET profit_goal_percent = 10 WHERE profit_goal_percent IS NULL;
UPDATE profiles SET commission_per_lot = 0 WHERE commission_per_lot IS NULL;
UPDATE profiles SET currency = 'USD' WHERE currency IS NULL;

UPDATE portfolios SET port_size = 1000 WHERE port_size IS NULL;
UPDATE portfolios SET profit_goal_percent = 10 WHERE profit_goal_percent IS NULL;
UPDATE portfolios SET commission_per_lot = 0 WHERE commission_per_lot IS NULL;
UPDATE portfolios SET currency = 'USD' WHERE currency IS NULL;

-- 4. Notify PostgREST to reload schema cache (Optional but helpful)
NOTIFY pgrst, 'reload schema';
