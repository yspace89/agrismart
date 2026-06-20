-- ============================================================
-- AgriSmart ERP — Schema Migration v11 (Push & Reminder Fixes)
-- ============================================================
-- Jalankan di Supabase SQL Editor

-- 1. Tambah notification_minute ke plant_reminders (jika belum ada)
ALTER TABLE public.plant_reminders
  ADD COLUMN IF NOT EXISTS notification_minute INTEGER NOT NULL DEFAULT 0
    CHECK (notification_minute >= 0 AND notification_minute <= 59);

-- 2. Recreate push_subscriptions dengan skema yang benar
--    (simpan seluruh PushSubscription JSON object, bukan field terpisah)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT         NOT NULL UNIQUE,          -- untuk dedup & delete cepat
  subscription JSONB       NOT NULL                  -- full PushSubscription object
);

-- Jika tabel sudah ada tanpa kolom subscription, tambahkan:
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS subscription JSONB;

-- RLS Policies
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_sub_select"  ON public.push_subscriptions;
CREATE POLICY "push_sub_select" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_sub_insert"  ON public.push_subscriptions;
CREATE POLICY "push_sub_insert" ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_sub_delete"  ON public.push_subscriptions;
CREATE POLICY "push_sub_delete" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 3. Index untuk performa cron query
CREATE INDEX IF NOT EXISTS idx_plant_reminders_next_send_active
  ON public.plant_reminders (next_send_at, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions (user_id);
