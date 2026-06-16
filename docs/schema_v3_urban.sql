-- ============================================================
-- AgriSmart ERP — Schema Migration v3 (Urban Farming & PWA)
-- ============================================================

-- 1. Tabel Profil Pengguna (Terkait dengan auth.users Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  user_mode TEXT DEFAULT 'pro', -- 'pro' untuk ERP, 'garden' untuk Urban Farming
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Langganan Push Notification (Web Push API)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  subscription JSONB NOT NULL, -- Menyimpan endpoint & keys dari browser
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktifkan RLS di tabel yang baru
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy untuk Profiles: User hanya bisa select/update profil mereka sendiri
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy untuk Push Subscriptions: User hanya bisa baca & tulis subscription miliknya
CREATE POLICY "Users can manage own subscriptions" 
ON push_subscriptions FOR ALL 
USING (auth.uid() = user_id);

-- Catatan:
-- Saat user mendaftar (sign up) di Supabase Auth,
-- kita idealnya butuh trigger otomatis untuk membuat row di `profiles`.
-- Ini bisa dijalankan di SQL Editor:

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk insert otomatis saat user mendaftar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
