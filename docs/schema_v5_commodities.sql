-- ============================================================
-- AgriSmart ERP — Schema Migration v5 (Commodities)
-- ============================================================

-- 1. Create Commodities Table
CREATE TABLE IF NOT EXISTS commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g. Perkebunan, Hortikultura, Pangan, Hias
  type TEXT NOT NULL, -- 'pro', 'garden', atau 'both'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Disable RLS or Add Policy so everyone can read it
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON commodities;
CREATE POLICY "Allow public read access" ON commodities FOR SELECT USING (true);

-- 3. Insert Seed Data
INSERT INTO commodities (name, category, type) VALUES
-- Perkebunan (Pro)
('Kelapa Sawit', 'Perkebunan', 'pro'),
('Karet', 'Perkebunan', 'pro'),
('Kopi Arabika', 'Perkebunan', 'pro'),
('Kopi Robusta', 'Perkebunan', 'pro'),
('Kakao', 'Perkebunan', 'pro'),
('Teh', 'Perkebunan', 'pro'),
('Tebu', 'Perkebunan', 'pro'),
('Kelapa', 'Perkebunan', 'pro'),
('Cengkeh', 'Perkebunan', 'pro'),
('Tembakau', 'Perkebunan', 'pro'),

-- Pangan (Pro/Both)
('Padi', 'Pangan', 'both'),
('Jagung', 'Pangan', 'both'),
('Kedelai', 'Pangan', 'both'),
('Singkong', 'Pangan', 'both'),

-- Hortikultura / Sayuran (Garden/Both)
('Cabai Merah', 'Hortikultura', 'both'),
('Cabai Rawit', 'Hortikultura', 'both'),
('Bawang Merah', 'Hortikultura', 'both'),
('Bawang Putih', 'Hortikultura', 'both'),
('Tomat', 'Hortikultura', 'both'),
('Pakcoy Hidroponik', 'Hortikultura', 'garden'),
('Selada Hidroponik', 'Hortikultura', 'garden'),
('Kangkung', 'Hortikultura', 'garden'),
('Bayam', 'Hortikultura', 'garden'),

-- Tanaman Hias (Garden)
('Monstera', 'Tanaman Hias', 'garden'),
('Aglonema', 'Tanaman Hias', 'garden'),
('Anggrek', 'Tanaman Hias', 'garden'),
('Kaktus', 'Tanaman Hias', 'garden'),
('Janda Bolong', 'Tanaman Hias', 'garden')
ON CONFLICT DO NOTHING;
