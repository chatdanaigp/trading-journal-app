-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolios." ON portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios." ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios." ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios." ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- Add portfolio_id to trades (nullable, null = default portfolio)
ALTER TABLE trades ADD COLUMN IF NOT EXISTS portfolio_id uuid REFERENCES portfolios(id);
