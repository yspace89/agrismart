-- ============================================================
-- AgriSmart ERP — Schema Migration v4 (Context Separation)
-- ============================================================

-- Menambahkan kolom type untuk memisahkan data Pro (Lahan Komersial) dan Garden (Urban Farming)
-- Nilai default 'pro' agar data lama tidak hilang/rusak.
ALTER TABLE lands 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'pro';

-- Memastikan bahwa type hanya bisa bernilai 'pro' atau 'garden'
ALTER TABLE lands
ADD CONSTRAINT chk_lands_type CHECK (type IN ('pro', 'garden'));
