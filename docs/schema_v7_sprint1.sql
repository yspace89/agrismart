-- ============================================================
-- AgriSmart ERP — Schema Migration v7 (Sprint 1: Subscription Status)
-- ============================================================

-- 1. Tambah kolom subscription_status ke tabel profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Catatan:
-- Saat kita butuh mengubah subscription via API, kita akan buat 
-- endpoint khusus menggunakan service_role key, 
-- karena RLS Profiles normalnya hanya mengizinkan user mengupdate
-- row miliknya (yang bisa disalahgunakan jika dikirim via client:
-- { subscription_status: 'pro' }).
-- 
-- Namun untuk sekarang, kita hanya sediakan kolomnya.
