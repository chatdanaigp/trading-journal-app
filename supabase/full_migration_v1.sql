-- ==========================================
-- UNIFIED SAFE MIGRATION (Global Platform)
-- ==========================================
-- คำแนะนำ: คัดลอกโค้ดทั้งหมดนี้ไปวางใน Supabase SQL Editor แล้วกด Run
-- โค้ดนี้ปลอดภัย (Idempotent) สามารถรันซ้ำกี่ครั้งก็ได้โดยไม่ทำให้ข้อมูลเก่าเสียหาย

-- 1. เพิ่มคอลัมน์ในตาราง Profiles (สำหรับระบบ Public Profile)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- 2. สร้างตาราง Portfolios (สำหรับระบบ Multi-Portfolio)
CREATE TABLE IF NOT EXISTS portfolios (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ตั้งค่าระบบความปลอดภัย (RLS) สำหรับตาราง Portfolios
DO $$ 
BEGIN
    ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- 4. สร้าง Policy สำหรับ Portfolios (ถ้ายังไม่มี)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own portfolios.' AND tablename = 'portfolios') THEN
        CREATE POLICY "Users can view their own portfolios." ON portfolios FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own portfolios.' AND tablename = 'portfolios') THEN
        CREATE POLICY "Users can insert their own portfolios." ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own portfolios.' AND tablename = 'portfolios') THEN
        CREATE POLICY "Users can update their own portfolios." ON portfolios FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own portfolios.' AND tablename = 'portfolios') THEN
        CREATE POLICY "Users can delete their own portfolios." ON portfolios FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. เพิ่มคอลัมน์ในตาราง Trades (Portfolio และ Strategy)
ALTER TABLE trades ADD COLUMN IF NOT EXISTS portfolio_id uuid REFERENCES portfolios(id);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS strategy text;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS screenshot_url text;

-- ✅ เสร็จสิ้น! ระบบพร้อมใช้งานครับ
