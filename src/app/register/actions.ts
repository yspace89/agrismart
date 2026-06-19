'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!email || !password) {
    redirect('/register?error=' + encodeURIComponent('Email dan password wajib diisi.'));
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    // [VULN-07 FIX] Juga tidak expose detail error registrasi ke user
    console.error('[Register] Auth error:', error.message);
    redirect('/register?error=' + encodeURIComponent('Gagal membuat akun. Pastikan email valid dan password minimal 6 karakter.'));
  }

  redirect('/login?message=' + encodeURIComponent('Registrasi berhasil! Silakan login.'));
}
