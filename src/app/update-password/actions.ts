'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || !confirmPassword) {
    redirect('/update-password?error=' + encodeURIComponent('Semua kolom wajib diisi.'))
  }

  if (password !== confirmPassword) {
    redirect('/update-password?error=' + encodeURIComponent('Password tidak cocok.'))
  }

  if (password.length < 6) {
    redirect('/update-password?error=' + encodeURIComponent('Password minimal 6 karakter.'))
  }

  // Update user's password
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error('[Update Password] error:', error.message)
    redirect('/update-password?error=' + encodeURIComponent('Gagal memperbarui password. Sesi mungkin sudah kadaluarsa.'))
  }

  // Sukses, arahkan ke login dengan pesan
  redirect('/login?message=' + encodeURIComponent('Password berhasil diperbarui! Silakan login dengan password baru Anda.'))
}
