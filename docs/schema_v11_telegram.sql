-- ============================================================
-- AgriSmart ERP — Schema Migration v11 (Telegram Chat ID)
-- ============================================================

-- Tambahkan kolom telegram_chat_id di tabel profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT UNIQUE;
