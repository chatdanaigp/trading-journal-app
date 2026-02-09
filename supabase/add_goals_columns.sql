-- Add columns for gamification goals
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS port_size numeric DEFAULT 1000,
ADD COLUMN IF NOT EXISTS profit_goal_percent numeric DEFAULT 10;

-- Optional: Update existing rows to have default values if needed
UPDATE profiles SET port_size = 1000, profit_goal_percent = 10 WHERE port_size IS NULL;
