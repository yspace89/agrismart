-- ============================================================
-- AgriSmart ERP — RLS Security Hardening (VULN-04 Fix)
-- Memperkuat Row Level Security: pisahkan hak akses
-- antara user biasa (authenticated) dan admin
--
-- CARA PAKAI:
-- 1. Jalankan di Supabase SQL Editor
-- 2. Pastikan kolom 'created_by' (UUID) ada di tabel expenses,
--    growth_logs, inventory, sensor_logs, dan tasks
--    (jika belum, lihat bagian "PERSIAPAN" di bawah)
-- ============================================================

-- ============================================================
-- PERSIAPAN: Tambahkan kolom user tracking jika belum ada
-- (Jalankan hanya jika kolom belum ada)
-- ============================================================

-- Tambah kolom created_by ke tabel yang perlu user-level isolation
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE growth_logs
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- STEP 1: Hapus semua policy lama yang terlalu permisif
-- ============================================================

-- LANDS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON lands;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON lands;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON lands;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON lands;

-- PLANTING_SEASONS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON planting_seasons;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON planting_seasons;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON planting_seasons;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON planting_seasons;

-- INVENTORY
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON inventory;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON inventory;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON inventory;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON inventory;

-- EXPENSES
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON expenses;

-- GROWTH_LOGS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON growth_logs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON growth_logs;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON growth_logs;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON growth_logs;

-- SENSOR_LOGS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sensor_logs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON sensor_logs;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON sensor_logs;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON sensor_logs;

-- TASKS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON tasks;

-- ============================================================
-- STEP 2: Buat helper function untuk cek role admin
-- Admin ditandai dengan custom claim 'role' = 'admin' di JWT
-- Set via: supabase.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } })
--
-- CATATAN: Function dibuat di schema PUBLIC (bukan auth)
-- karena schema auth diproteksi Supabase dan tidak bisa
-- dimodifikasi via SQL Editor (error 42501)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 3: Buat policy baru yang lebih restrictive
-- Prinsip:
--   READ   → semua authenticated user bisa baca (data farm bersifat shared)
--   INSERT → semua authenticated user bisa tambah data
--   UPDATE → hanya user yang membuat record ATAU admin
--   DELETE → HANYA admin
--
-- Hapus dulu jika sudah ada (idempotent — aman dijalankan berulang)
-- ============================================================

-- Bersihkan policy baru yang mungkin sudah terbuat di run sebelumnya
DROP POLICY IF EXISTS "lands_select" ON lands;
DROP POLICY IF EXISTS "lands_insert" ON lands;
DROP POLICY IF EXISTS "lands_update" ON lands;
DROP POLICY IF EXISTS "lands_delete" ON lands;

DROP POLICY IF EXISTS "seasons_select" ON planting_seasons;
DROP POLICY IF EXISTS "seasons_insert" ON planting_seasons;
DROP POLICY IF EXISTS "seasons_update" ON planting_seasons;
DROP POLICY IF EXISTS "seasons_delete" ON planting_seasons;

DROP POLICY IF EXISTS "inventory_select" ON inventory;
DROP POLICY IF EXISTS "inventory_insert" ON inventory;
DROP POLICY IF EXISTS "inventory_update" ON inventory;
DROP POLICY IF EXISTS "inventory_delete" ON inventory;

DROP POLICY IF EXISTS "expenses_select" ON expenses;
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
DROP POLICY IF EXISTS "expenses_update" ON expenses;
DROP POLICY IF EXISTS "expenses_delete" ON expenses;

DROP POLICY IF EXISTS "growth_logs_select" ON growth_logs;
DROP POLICY IF EXISTS "growth_logs_insert" ON growth_logs;
DROP POLICY IF EXISTS "growth_logs_update" ON growth_logs;
DROP POLICY IF EXISTS "growth_logs_delete" ON growth_logs;

DROP POLICY IF EXISTS "sensor_logs_select" ON sensor_logs;
DROP POLICY IF EXISTS "sensor_logs_insert" ON sensor_logs;
DROP POLICY IF EXISTS "sensor_logs_update" ON sensor_logs;
DROP POLICY IF EXISTS "sensor_logs_delete" ON sensor_logs;

DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

-- ---- LANDS ----
-- Lands adalah master data, hanya admin yang bisa ubah/hapus
CREATE POLICY "lands_select" ON lands
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "lands_insert" ON lands
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "lands_update" ON lands
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "lands_delete" ON lands
  FOR DELETE TO authenticated USING (public.is_admin());

-- ---- PLANTING_SEASONS ----
-- Master data musim tanam, hanya admin yang bisa CRUD penuh
CREATE POLICY "seasons_select" ON planting_seasons
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "seasons_insert" ON planting_seasons
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "seasons_update" ON planting_seasons
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "seasons_delete" ON planting_seasons
  FOR DELETE TO authenticated USING (public.is_admin());

-- ---- INVENTORY ----
-- Semua bisa READ, INSERT; UPDATE/DELETE hanya admin
CREATE POLICY "inventory_select" ON inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "inventory_insert" ON inventory
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "inventory_update" ON inventory
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "inventory_delete" ON inventory
  FOR DELETE TO authenticated USING (public.is_admin());

-- ---- EXPENSES ----
-- Semua bisa READ/INSERT, UPDATE/DELETE hanya yang membuat atau admin
CREATE POLICY "expenses_select" ON expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "expenses_insert" ON expenses
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "expenses_update" ON expenses
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

CREATE POLICY "expenses_delete" ON expenses
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---- GROWTH_LOGS ----
CREATE POLICY "growth_logs_select" ON growth_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "growth_logs_insert" ON growth_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "growth_logs_update" ON growth_logs
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

CREATE POLICY "growth_logs_delete" ON growth_logs
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---- SENSOR_LOGS ----
-- Biasanya ditulis oleh sistem/IoT, user hanya baca
CREATE POLICY "sensor_logs_select" ON sensor_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "sensor_logs_insert" ON sensor_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "sensor_logs_update" ON sensor_logs
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "sensor_logs_delete" ON sensor_logs
  FOR DELETE TO authenticated USING (public.is_admin());

-- ---- TASKS ----
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STEP 4: Cara set user sebagai admin
-- Jalankan di Supabase SQL Editor atau via Admin API:
-- ============================================================
-- UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
--   WHERE email = 'admin@agrinova.app';
--
-- Atau via Supabase Admin API (Node.js):
-- await supabase.auth.admin.updateUserById(userId, {
--   app_metadata: { role: 'admin' }
-- });
-- ============================================================

-- Catatan:
-- Webhook Telegram dan operasi IoT menggunakan Service Role Key yang bypass RLS.
-- Endpoint-endpoint tersebut HARUS diamankan di level aplikasi (lihat VULN-02 fix).
