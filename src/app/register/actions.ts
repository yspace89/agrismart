'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

// [VULN-07 FIX] Invite-only registration
// Set REGISTRATION_INVITE_CODE di .env.local
// Kosongkan value untuk menonaktifkan registrasi publik sepenuhnya
const INVITE_CODE = process.env.REGISTRATION_INVITE_CODE;

export async function register(formData: FormData) {
  // [VULN-07 FIX] Validasi invite code sebelum proses apapun
  // Jika REGISTRATION_INVITE_CODE tidak di-set di env, registrasi selalu ditolak
  if (!INVITE_CODE) {
    redirect('/register?error=' + encodeURIComponent('Registrasi publik dinonaktifkan. Hubungi administrator untuk mendapatkan akses.'));
  }

  const inviteCode = formData.get('invite_code') as string;
  if (!inviteCode || inviteCode.trim() !== INVITE_CODE) {
    // Delay kecil agar tidak mudah di-brute-force
    await new Promise((resolve) => setTimeout(resolve, 500));
    redirect('/register?error=' + encodeURIComponent('Kode undangan tidak valid.'));
  }

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
