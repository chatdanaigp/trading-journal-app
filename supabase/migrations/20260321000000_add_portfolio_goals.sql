-- Add goal columns to portfolios table
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS port_size numeric DEFAULT 1000,
ADD COLUMN IF NOT EXISTS profit_goal_percent numeric DEFAULT 10;

-- Update existing rows to have default values if null
UPDATE portfolios SET port_size = 1000 WHERE port_size IS NULL;
UPDATE portfolios SET profit_goal_percent = 10 WHERE profit_goal_percent IS NULL;
