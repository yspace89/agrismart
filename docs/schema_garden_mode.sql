-- ============================================================
-- AGRITIVA - GARDEN MODE SCHEMA MIGRATION
-- ============================================================
-- Tabel khusus untuk fitur Mode Berkebun (Garden Mode).
-- Memisahkan entitas "Tanaman Individu" dari "Lahan/Petak" di mode Pro.

-- 1. TABEL PLANTS (Tanamanku)
CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL, -- Nama panggilan/lokal (Cth: Tomat Ceri Balkon)
  species TEXT, -- Nama spesies/ilmiah opsional
  type TEXT NOT NULL, -- Kategori: Sayuran, Buah, Herbal, Bunga, Sukulen, dll.
  location TEXT, -- Pot, Bedengan A, Balkon
  
  status TEXT NOT NULL DEFAULT 'Sehat', -- Sehat, Sakit, Kering, Mati, Panen
  light_requirement TEXT, -- Full Sun, Partial Shade, Indoor
  water_frequency_days INTEGER DEFAULT 1, -- Disiram tiap X hari
  
  -- Tambahan untuk Dynamic Form (Hias vs Sayur)
  planting_purpose TEXT DEFAULT 'Hiasan', -- 'Hiasan' atau 'Panen'
  quantity_description TEXT, -- Misal: "5 Polybag", "1 Bedengan"
  planted_date DATE, -- Tanggal mulai tanam/semai
  estimated_harvest_days INTEGER,
  growth_stage TEXT, -- 'Semai', 'Vegetatif', 'Berbunga/Berbuah', 'Siap Panen'
  photo_url TEXT,
  
  notes TEXT
);

-- 2. TABEL PLANT_LOGS (Jurnal / Jadwal Rawat)
CREATE TABLE IF NOT EXISTS public.plant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL, -- Siram, Pupuk, Pangkas, Hama, Catatan, Update Kondisi
  notes TEXT,
  photo_url TEXT -- URL ke Supabase Storage (bucket: plant-photos)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Prinsip: Setiap user HANYA bisa melihat dan mengubah kebun/tanamannya sendiri.
-- Berbeda dengan Pro mode di mana semua user (pegawai) bisa melihat lahan.
-- ============================================================

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES UNTUK PLANTS
DROP POLICY IF EXISTS "plants_select" ON public.plants;
CREATE POLICY "plants_select" ON public.plants
  FOR SELECT TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "plants_insert" ON public.plants;
CREATE POLICY "plants_insert" ON public.plants
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "plants_update" ON public.plants;
CREATE POLICY "plants_update" ON public.plants
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "plants_delete" ON public.plants;
CREATE POLICY "plants_delete" ON public.plants
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- POLICIES UNTUK PLANT_LOGS
DROP POLICY IF EXISTS "plant_logs_select" ON public.plant_logs;
CREATE POLICY "plant_logs_select" ON public.plant_logs
  FOR SELECT TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "plant_logs_insert" ON public.plant_logs;
CREATE POLICY "plant_logs_insert" ON public.plant_logs
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "plant_logs_update" ON public.plant_logs;
CREATE POLICY "plant_logs_update" ON public.plant_logs
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "plant_logs_delete" ON public.plant_logs;
CREATE POLICY "plant_logs_delete" ON public.plant_logs
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ============================================================
-- SUPABASE STORAGE BUCKET (Jika dijalankan via Admin / SQL)
-- Catatan: Eksekusi SQL ini mungkin gagal jika tidak punya role superuser.
-- Jika gagal, buat bucket "plant-photos" secara manual di Supabase Dashboard.
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('plant-photos', 'plant-photos', true)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Beri akses upload foto untuk user terautentikasi"
-- ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'plant-photos');
-- CREATE POLICY "Semua orang bisa melihat foto tanaman"
-- ON storage.objects FOR SELECT USING (bucket_id = 'plant-photos');

-- ============================================================
-- MIGRATION FOR EXISTING TABLES
-- ============================================================
ALTER TABLE public.plants 
  ADD COLUMN IF NOT EXISTS planting_purpose TEXT DEFAULT 'Hiasan',
  ADD COLUMN IF NOT EXISTS quantity_description TEXT,
  ADD COLUMN IF NOT EXISTS planted_date DATE,
  ADD COLUMN IF NOT EXISTS estimated_harvest_days INTEGER,
  ADD COLUMN IF NOT EXISTS growth_stage TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;
