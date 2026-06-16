-- ============================================================
-- AgriSmart ERP — RLS & Security Migration
-- Mengamankan database dengan Row Level Security
-- 
-- CARA PAKAI: Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Mengaktifkan Row Level Security di setiap tabel
ALTER TABLE lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE planting_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 2. Membuat Policy: Hanya User yang sudah Login (Authenticated) yang bisa CRUD
-- Karena sistem ERP ini bersifat private, tidak ada akses publik.

-- LANDS
CREATE POLICY "Enable read access for authenticated users" ON lands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON lands FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON lands FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON lands FOR DELETE TO authenticated USING (true);

-- PLANTING_SEASONS
CREATE POLICY "Enable read access for authenticated users" ON planting_seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON planting_seasons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON planting_seasons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON planting_seasons FOR DELETE TO authenticated USING (true);

-- INVENTORY
CREATE POLICY "Enable read access for authenticated users" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON inventory FOR DELETE TO authenticated USING (true);

-- EXPENSES
CREATE POLICY "Enable read access for authenticated users" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON expenses FOR DELETE TO authenticated USING (true);

-- GROWTH_LOGS
CREATE POLICY "Enable read access for authenticated users" ON growth_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON growth_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON growth_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON growth_logs FOR DELETE TO authenticated USING (true);

-- SENSOR_LOGS
CREATE POLICY "Enable read access for authenticated users" ON sensor_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON sensor_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON sensor_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON sensor_logs FOR DELETE TO authenticated USING (true);

-- TASKS
CREATE POLICY "Enable read access for authenticated users" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON tasks FOR DELETE TO authenticated USING (true);

-- Catatan:
-- Webhook Telegram menggunakan Service Role Key / bypasses RLS,
-- jadi Insert melalui Telegram akan tetap berhasil.
