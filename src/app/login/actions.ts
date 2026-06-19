'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

// [VULN-06 FIX] Map error codes dari Supabase ke pesan user-friendly yang generik
// Tidak mengekspose detail internal (user enumeration, db info, dll)
function getGenericErrorMessage(supabaseError: string): string {
  const lower = supabaseError.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid password')) {
    return 'Email atau password salah. Silakan coba lagi.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Akun belum diverifikasi. Cek email Anda untuk link konfirmasi.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Terlalu banyak percobaan login. Tunggu beberapa menit dan coba lagi.';
  }
  // Fallback generik — tidak expose detail error dari Supabase
  return 'Terjadi kesalahan saat login. Silakan coba lagi.';
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validasi input dasar
  if (!data.email || !data.password) {
    redirect('/login?error=' + encodeURIComponent('Email dan password wajib diisi.'))
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // [VULN-06 FIX] Log error asli di server untuk debugging
    console.error('[Login] Auth error:', error.message);
    // Kirim pesan generik ke client — bukan error.message mentah dari Supabase
    const friendlyMessage = getGenericErrorMessage(error.message);
    redirect('/login?error=' + encodeURIComponent(friendlyMessage))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
