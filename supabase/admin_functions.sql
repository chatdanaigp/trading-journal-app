-- Admin Functions (SECURITY DEFINER = bypasses RLS)
-- These functions check admin status internally before performing operations.

-- Helper: Check if calling user is admin (by UUID list OR username)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_ids uuid[] := ARRAY[
    '2df9465c-d83c-4302-a6ca-18880514482f'::uuid
  ];
BEGIN
  -- Check by User ID first
  IF auth.uid() = ANY(admin_ids) THEN
    RETURN true;
  END IF;

  -- Fallback: check username
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND username = 'admin'
  );
END;
$$;

-- Admin: Update any user's profile
CREATE OR REPLACE FUNCTION admin_update_profile(
  target_user_id uuid,
  new_username text DEFAULT NULL,
  new_full_name text DEFAULT NULL,
  new_port_size numeric DEFAULT NULL,
  new_goal_percent numeric DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  UPDATE profiles SET
    username = COALESCE(new_username, username),
    full_name = COALESCE(new_full_name, full_name),
    port_size = COALESCE(new_port_size, port_size),
    profit_goal_percent = COALESCE(new_goal_percent, profit_goal_percent),
    updated_at = now()
  WHERE id = target_user_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Admin: Delete all trades for a user
CREATE OR REPLACE FUNCTION admin_delete_user_trades(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT is_admin() THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  DELETE FROM trades WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN json_build_object('success', true, 'deleted', deleted_count);
END;
$$;

-- Admin: Delete all journal entries for a user
CREATE OR REPLACE FUNCTION admin_delete_user_journal(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT is_admin() THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  DELETE FROM journal_entries WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN json_build_object('success', true, 'deleted', deleted_count);
END;
$$;

-- Admin: Delete a user entirely (trades + journal + profile)
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  -- Delete trades
  DELETE FROM trades WHERE user_id = target_user_id;
  -- Delete journal entries
  DELETE FROM journal_entries WHERE user_id = target_user_id;
  -- Delete profile
  DELETE FROM profiles WHERE id = target_user_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Admin: Get all users with trade stats
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  port_size numeric,
  profit_goal_percent numeric,
  client_id text,
  total_trades bigint,
  total_profit numeric,
  win_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.port_size,
    p.profit_goal_percent,
    p.client_id,
    COUNT(t.id) AS total_trades,
    COALESCE(SUM(t.profit), 0) AS total_profit,
    ROUND(
      (COUNT(CASE WHEN t.profit > 0 THEN 1 END)::numeric / NULLIF(COUNT(t.id), 0)::numeric) * 100,
      1
    ) AS win_rate
  FROM profiles p
  LEFT JOIN trades t ON t.user_id = p.id
  GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.port_size, p.profit_goal_percent, p.client_id
  ORDER BY total_trades DESC;
END;
$$;
