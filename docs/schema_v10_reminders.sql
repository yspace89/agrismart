-- ============================================================
-- AgriSmart ERP — Schema Migration v10 (Plant Reminders)
-- ============================================================
-- Jalankan di Supabase SQL Editor

-- 1. Tabel plant_reminders
CREATE TABLE IF NOT EXISTS public.plant_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,

  activity_type TEXT NOT NULL, -- Siram, Pupuk, Pangkas, Semprot, Lainnya
  frequency_days INTEGER NOT NULL DEFAULT 1, -- Setiap X hari
  notification_hour INTEGER NOT NULL DEFAULT 7 CHECK (notification_hour >= 0 AND notification_hour <= 23), -- Jam 0-23 (WIB)

  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ -- Kapan notif berikutnya harus dikirim
);

-- 2. RLS Policies
ALTER TABLE public.plant_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reminders_select" ON public.plant_reminders;
CREATE POLICY "reminders_select" ON public.plant_reminders
  FOR SELECT TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "reminders_insert" ON public.plant_reminders;
CREATE POLICY "reminders_insert" ON public.plant_reminders
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "reminders_update" ON public.plant_reminders;
CREATE POLICY "reminders_update" ON public.plant_reminders
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "reminders_delete" ON public.plant_reminders;
CREATE POLICY "reminders_delete" ON public.plant_reminders
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 3. Tabel push_subscriptions (jika belum ada dari schema sebelumnya)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_sub_select" ON public.push_subscriptions;
CREATE POLICY "push_sub_select" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_sub_insert" ON public.push_subscriptions;
CREATE POLICY "push_sub_insert" ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_sub_delete" ON public.push_subscriptions;
CREATE POLICY "push_sub_delete" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());
