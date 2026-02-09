-- 1. Create a function to get leaderboard stats
-- This function runs with "SECURITY DEFINER" privileges, meaning it bypasses Row Level Security (RLS).
-- This is safe because it only returns aggregated data (stats), not individual private trades.

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  username text,
  full_name text,
  avatar_url text,
  total_trades bigint,
  win_rate numeric,
  net_profit numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.username,
    p.full_name,
    p.avatar_url,
    COUNT(t.id) AS total_trades,
    -- Calculate Win Rate: (Wins / Total) * 100
    ROUND(
      (COUNT(CASE WHEN t.profit > 0 THEN 1 END)::numeric / NULLIF(COUNT(t.id), 0)::numeric) * 100, 
      1
    ) AS win_rate,
    -- Calculate Net Profit
    SUM(t.profit) AS net_profit
  FROM trades t
  JOIN profiles p ON t.user_id = p.id
  GROUP BY p.id, p.username, p.full_name, p.avatar_url
  HAVING COUNT(t.id) > 0 -- Only show users who have traded
  ORDER BY net_profit DESC
  LIMIT 10;
END;
$$;
