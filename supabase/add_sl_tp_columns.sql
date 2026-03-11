-- Add Stop Loss and Take Profit columns to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS stop_loss numeric;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS take_profit numeric;
