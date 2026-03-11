-- 1. อัพเดตเวลาของออเดอร์เก่าที่ถูกเก็บบันทึกเวลาไว้ที่ 12:00:00 UTC (หรือ 19:00 น. เวลาไทย) แบบตายตัว
-- 2. ระบบจะสุ่มเวลาใหม่ให้ออเดอร์เหล่านี้กระจายอยู่ในช่วง 09:00 - 18:00 แทน (เพื่อให้เรียงลำดับดูเป็นธรรมชาติ)
-- หมายเหตุ: วันที่จะยังคงถูกอิงตามวันที่เทรดเดิม ไม่เปลี่ยนแปลง

UPDATE public.trades
SET created_at = date_trunc('day', created_at at time zone 'UTC') at time zone 'UTC'
                 + (random() * 9 + 2) * interval '1 hour' 
                 + random() * 60 * interval '1 minute'
WHERE EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') = 12
  AND EXTRACT(MINUTE FROM created_at AT TIME ZONE 'UTC') = 0
  AND EXTRACT(SECOND FROM created_at AT TIME ZONE 'UTC') = 0;
