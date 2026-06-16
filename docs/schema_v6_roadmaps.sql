-- ============================================================
-- AgriSmart ERP — Schema Migration v6 (Auto-Task Roadmaps)
-- ============================================================

-- 1. Tambah kolom due_date dan task_type di tabel tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'general';

-- 2. Buat tabel master roadmap untuk komoditas
CREATE TABLE IF NOT EXISTS crop_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_name TEXT NOT NULL, -- Nama komoditas, misal 'Cabai Merah'
    day_offset INTEGER NOT NULL, -- Hari ke-N setelah tanam (start_date)
    title TEXT NOT NULL, -- Judul tugas
    description TEXT, -- Deskripsi tugas
    task_type TEXT DEFAULT 'general', -- 'watering', 'fertilizer', 'harvest', dll
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buka akses RLS sementara untuk crop_roadmaps agar mudah diuji secara lokal
ALTER TABLE crop_roadmaps DISABLE ROW LEVEL SECURITY;

-- 3. Suntikkan (Seed) Data Roadmap Standar untuk Cabai Merah & Tomat

-- Hapus data seed lama agar tidak ganda jika script dijalankan ulang
DELETE FROM crop_roadmaps WHERE commodity_name IN ('Cabai Merah', 'Tomat');

-- ROADMAP: CABAI MERAH
INSERT INTO crop_roadmaps (commodity_name, day_offset, title, description, task_type) VALUES
('Cabai Merah', 0, 'Semaikan Benih', 'Semai benih di tray semai. Pastikan media tanam lembab.', 'planting'),
('Cabai Merah', 7, 'Pindah Tanam (Transplanting)', 'Pindahkan bibit yang sudah berdaun 4 ke pot atau lahan.', 'planting'),
('Cabai Merah', 14, 'Pemupukan NPK Susulan 1', 'Berikan pupuk NPK 16-16-16 (1 sendok makan per tanaman) dilarutkan dalam 10L air.', 'fertilizer'),
('Cabai Merah', 21, 'Cek Hama & Semprot Neem Oil', 'Periksa bagian bawah daun dari kutu putih/aphids. Semprot neem oil jika perlu.', 'maintenance'),
('Cabai Merah', 30, 'Pemangkasan Pucuk (Topping)', 'Potong pucuk utama agar cabang samping rimbun.', 'maintenance'),
('Cabai Merah', 45, 'Pemupukan Fase Generatif', 'Gunakan pupuk tinggi Kalium (K) dan Phospat (P) untuk merangsang bunga.', 'fertilizer'),
('Cabai Merah', 75, 'Panen Pertama', 'Panen buah yang sudah merah merata di pagi hari.', 'harvest');

-- ROADMAP: TOMAT
INSERT INTO crop_roadmaps (commodity_name, day_offset, title, description, task_type) VALUES
('Tomat', 0, 'Semaikan Benih Tomat', 'Gunakan media tanam cocopeat + kompos (1:1).', 'planting'),
('Tomat', 14, 'Pindah Tanam', 'Pindahkan bibit setinggi 10-15cm ke lahan/polybag.', 'planting'),
('Tomat', 21, 'Pasang Ajir (Penyangga)', 'Pasang tiang penyangga (ajir) bambu setinggi 1.5 meter di sebelah tanaman.', 'maintenance'),
('Tomat', 30, 'Pruning Daun Bawah', 'Pangkas daun-daun tua di bagian bawah yang menyentuh tanah untuk mencegah jamur.', 'maintenance'),
('Tomat', 35, 'Pemupukan Fase Bunga', 'Berikan pupuk tinggi Kalium/MKP.', 'fertilizer'),
('Tomat', 60, 'Panen Pertama', 'Panen buah tomat yang sudah mulai memerah.', 'harvest');
