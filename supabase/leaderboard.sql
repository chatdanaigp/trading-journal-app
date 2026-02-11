-- Enhanced Leaderboard Function with Comprehensive Stats
-- Fixed: Renamed return column to avoid "user_id is ambiguous" error

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  out_user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  total_trades bigint,
  win_rate numeric,
  net_profit numeric,
  profit_factor numeric,
  avg_trade numeric,
  best_trade numeric,
  worst_trade numeric,
  current_streak integer,
  longest_win_streak integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      COUNT(t.id) AS total_trades,
      
      -- Win Rate: (Wins / Total) * 100
      ROUND(
        (COUNT(CASE WHEN t.profit > 0 THEN 1 END)::numeric / NULLIF(COUNT(t.id), 0)::numeric) * 100, 
        1
      ) AS win_rate,
      
      -- Net Profit
      COALESCE(SUM(t.profit), 0) AS net_profit,
      
      -- Profit Factor: Total Wins / |Total Losses|
      ROUND(
        COALESCE(
          SUM(CASE WHEN t.profit > 0 THEN t.profit END) / 
          NULLIF(ABS(SUM(CASE WHEN t.profit < 0 THEN t.profit END)), 0),
          0
        ),
        2
      ) AS profit_factor,
      
      -- Average Trade
      ROUND(
        COALESCE(SUM(t.profit) / NULLIF(COUNT(t.id), 0), 0),
        2
      ) AS avg_trade,
      
      -- Best Trade
      COALESCE(MAX(t.profit), 0) AS best_trade,
      
      -- Worst Trade
      COALESCE(MIN(t.profit), 0) AS worst_trade
      
    FROM profiles p
    LEFT JOIN trades t ON t.user_id = p.id
    GROUP BY p.id, p.username, p.full_name, p.avatar_url
  ),
  streak_calc AS (
    SELECT
      us.id,
      -- Current Streak (last consecutive wins/losses)
      (
        SELECT COUNT(*)
        FROM (
          SELECT tr.profit,
                 CASE WHEN tr.profit > 0 THEN 'win' ELSE 'loss' END as result
          FROM trades tr
          WHERE tr.user_id = us.id
          ORDER BY tr.created_at DESC
          LIMIT 5
        ) recent
        WHERE result = (
          SELECT CASE WHEN tr2.profit > 0 THEN 'win' ELSE 'loss' END
          FROM trades tr2
          WHERE tr2.user_id = us.id
          ORDER BY tr2.created_at DESC
          LIMIT 1
        )
      )::integer AS current_streak,
      
      -- Longest Win Streak
      (
        SELECT MAX(streak_count)
        FROM (
          SELECT 
            COUNT(*) as streak_count
          FROM (
            SELECT 
              tr3.profit,
              SUM(CASE WHEN tr3.profit <= 0 THEN 1 ELSE 0 END) OVER (ORDER BY tr3.created_at) as grp
            FROM trades tr3
            WHERE tr3.user_id = us.id
          ) grouped
          WHERE grouped.profit > 0
          GROUP BY grouped.grp
        ) streaks
      )::integer AS longest_win_streak
      
    FROM user_stats us
  )
  SELECT
    us.id,
    us.username,
    us.full_name,
    us.avatar_url,
    us.total_trades,
    us.win_rate,
    us.net_profit,
    us.profit_factor,
    us.avg_trade,
    us.best_trade,
    us.worst_trade,
    COALESCE(sc.current_streak, 0),
    COALESCE(sc.longest_win_streak, 0)
  FROM user_stats us
  LEFT JOIN streak_calc sc ON us.id = sc.id
  WHERE us.total_trades > 0  -- Only show users who have traded
  ORDER BY us.net_profit DESC;
END;
$$;
