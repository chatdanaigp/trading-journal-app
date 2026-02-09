-- Add a column to store AI feedback
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS ai_analysis text;

-- (Optional) Update RLS to allow users to update their own trade's analysis 
-- (Existing policies might already cover 'UPDATE' if set broadly, usually we check policy)
-- Assuming the Update policy allows the user to update their own rows.
