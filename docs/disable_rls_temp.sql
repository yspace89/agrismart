-- ============================================================
-- AgriSmart ERP — Disable RLS for Local Testing
-- ============================================================

-- Karena saat ini kita sedang fokus menguji UI dan fitur, 
-- dan Anda mungkin belum melakukan Login (berstatus Anonim),
-- maka Insert data akan diblokir oleh sistem keamanan Supabase (RLS).

-- Jalankan skrip ini untuk menonaktifkan keamanan sementara
-- agar kita bisa leluasa menguji fitur simpan data:

ALTER TABLE lands DISABLE ROW LEVEL SECURITY;
ALTER TABLE planting_seasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE growth_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- Catatan: Nanti saat akan rilis (Production), kita akan 
-- mengaktifkannya kembali setelah sistem Login selesai dibuat.
