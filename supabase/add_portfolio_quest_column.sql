-- Add column to track whether the user has explicitly opted into the Portfolio Building Quest
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_portfolio_quest_active boolean DEFAULT false;
