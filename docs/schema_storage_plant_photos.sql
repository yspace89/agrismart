-- ============================================================
-- Supabase Storage Setup: plant-photos
-- ============================================================
-- Jalankan di Supabase SQL Editor

-- 1. Create the bucket if it doesn't exist (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if any to avoid errors
DROP POLICY IF EXISTS "Allow public view for plant-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads for plant-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates for plant-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes for plant-photos" ON storage.objects;

-- 3. Create RLS Policies for the bucket
-- Allow anyone to view photos
CREATE POLICY "Allow public view for plant-photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'plant-photos');

-- Allow logged in users to upload photos
CREATE POLICY "Allow authenticated uploads for plant-photos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'plant-photos');

-- Allow logged in users to update their own photos
CREATE POLICY "Allow authenticated updates for plant-photos" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'plant-photos' AND auth.uid() = owner);

-- Allow logged in users to delete their own photos
CREATE POLICY "Allow authenticated deletes for plant-photos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'plant-photos' AND auth.uid() = owner);
