'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const phoneNumber = formData.get('phone_number') as string;
  const location = formData.get('location') as string;

  if (!email || !password || !fullName) {
    redirect('/register?error=' + encodeURIComponent('Nama Lengkap, Email, dan Password wajib diisi.'));
  }

  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        location: location
      }
    }
  })

  if (error) {
    // [VULN-07 FIX] Juga tidak expose detail error registrasi ke user
    console.error('[Register] Auth error:', error.message);
    redirect('/register?error=' + encodeURIComponent('Gagal membuat akun. Pastikan email valid dan password minimal 6 karakter.'));
  }

  redirect('/login?message=' + encodeURIComponent('Registrasi berhasil! Silakan login.'));
}
