-- ============================================================
-- AgriSmart ERP — Schema Migration v10.1 (Add Minutes to Reminders)
-- ============================================================
-- Jalankan di Supabase SQL Editor

ALTER TABLE public.plant_reminders 
ADD COLUMN IF NOT EXISTS notification_minute INTEGER NOT NULL DEFAULT 0 CHECK (notification_minute >= 0 AND notification_minute <= 59);
