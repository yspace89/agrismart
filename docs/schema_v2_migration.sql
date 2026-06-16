-- ============================================================
-- AgriSmart ERP — Schema Migration v2 (FIXED)
-- Fix: Sync schema dengan kode yang sudah ada
-- 
-- CARA PAKAI: Jalankan di Supabase SQL Editor
-- Dipisah menjadi 2 bagian agar lebih aman.
-- ============================================================

-- ==========================================
-- BAGIAN 1: ALTER TABLES & CREATE TABLE
-- (Jalankan ini dulu, lalu jalankan Bagian 2)
-- ==========================================

-- 1. Tambah kolom yang hilang di tabel 'lands'
ALTER TABLE lands
  ADD COLUMN IF NOT EXISTS pic_name TEXT,
  ADD COLUMN IF NOT EXISTS pic_telegram_id TEXT;

-- 2. Tambah tabel 'tasks'
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES lands(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, done
    assigned_telegram_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tambah kolom 'price_per_unit' di inventory
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL DEFAULT 0;

-- 4. Tambah kolom budget per kategori & yield di planting_seasons
ALTER TABLE planting_seasons
  ADD COLUMN IF NOT EXISTS budget_seed DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_fertilizer DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_labor DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_logistics DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_fuel DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_others DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_yield_tons DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_yield_tons DECIMAL DEFAULT 0;

-- 5. Tambah kolom approval & tracking di expenses
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS submitted_by TEXT,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS telegram_message_id TEXT,
  ADD COLUMN IF NOT EXISTS inventory_id UUID REFERENCES inventory(id);

-- 6. Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_expenses_season_id ON expenses(season_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_logs_season_id ON growth_logs(season_id);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_land_id ON sensor_logs(land_id);
CREATE INDEX IF NOT EXISTS idx_tasks_land_id ON tasks(land_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_planting_seasons_land_id ON planting_seasons(land_id);


-- ==========================================
-- BAGIAN 2: DROP & RECREATE VIEWS
-- (Jalankan SETELAH Bagian 1 berhasil)
-- ==========================================

-- PENTING: Harus DROP dulu karena struktur kolom berubah
DROP VIEW IF EXISTS v_season_financials;
DROP VIEW IF EXISTS v_inventory_status;

-- Recreate v_season_financials dengan kolom lengkap + burn rate harian
CREATE VIEW v_season_financials AS
SELECT 
    ps.id AS season_id,
    ps.crop_name,
    ps.budget_total,
    ps.start_date,
    ps.estimated_harvest_date,
    ps.status,
    ps.target_yield_tons,
    ps.actual_yield_tons,
    l.name AS land_name,
    COALESCE(SUM(e.amount), 0) AS total_spent,
    ps.budget_total - COALESCE(SUM(e.amount), 0) AS remaining_budget,
    (COALESCE(SUM(e.amount), 0) / NULLIF(ps.budget_total, 0)) * 100 AS burn_rate_percent,
    -- Burn Rate Harian: total pengeluaran / jumlah hari sejak mulai tanam
    CASE 
        WHEN CURRENT_DATE > ps.start_date 
        THEN COALESCE(SUM(e.amount), 0) / (CURRENT_DATE - ps.start_date)
        ELSE 0
    END AS daily_burn_rate,
    -- Estimasi sisa hari dana berdasarkan burn rate harian
    CASE 
        WHEN CURRENT_DATE > ps.start_date AND COALESCE(SUM(e.amount), 0) > 0
        THEN (ps.budget_total - COALESCE(SUM(e.amount), 0)) / 
             (COALESCE(SUM(e.amount), 0) / (CURRENT_DATE - ps.start_date))
        ELSE NULL
    END AS estimated_days_remaining
FROM planting_seasons ps
LEFT JOIN expenses e ON ps.id = e.season_id
LEFT JOIN lands l ON ps.land_id = l.id
GROUP BY ps.id, ps.crop_name, ps.budget_total, ps.start_date, 
         ps.estimated_harvest_date, ps.status, ps.target_yield_tons,
         ps.actual_yield_tons, l.name;

-- Recreate v_inventory_status dengan kolom price_per_unit yang baru ditambah
CREATE VIEW v_inventory_status AS
SELECT
    i.*,
    CASE
        WHEN i.quantity = 0 THEN 'empty'
        WHEN i.quantity <= i.par_level THEN 'critical'
        WHEN i.quantity <= i.par_level * 1.5 THEN 'low'
        ELSE 'ok'
    END AS stock_status,
    i.quantity * i.price_per_unit AS total_value
FROM inventory i;

-- ============================================================
-- SELESAI! Kedua bagian sudah berhasil dijalankan.
-- ============================================================
