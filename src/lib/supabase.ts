import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase credentials are missing. Please check your .env file or Vercel Environment Variables.');
}

/**
 * [VULN-08 KLARIFIKASI] Supabase client dengan ANON KEY.
 *
 * Client ini menggunakan ANON KEY (bukan Service Role Key), sehingga:
 * - RLS (Row Level Security) TETAP BERLAKU untuk semua operasi
 * - Client aman digunakan di server-side code seperti API routes Telegram
 *   (operasi akan dibatasi oleh policy RLS yang aktif)
 *
 * PENTING: Jangan pernah ganti key ini ke SUPABASE_SERVICE_ROLE_KEY
 * kecuali benar-benar diperlukan dan endpoint SUDAH diamankan dengan auth.
 *
 * Untuk keperluan admin/bypass RLS yang aman, gunakan:
 * import { createClient } from '@supabase/supabase-js';
 * const adminClient = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
 * // dan pastikan hanya digunakan di server-side yang sudah terautentikasi
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
