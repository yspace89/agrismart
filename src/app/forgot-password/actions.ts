'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=' + encodeURIComponent('Email wajib diisi.'))
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  })

  if (error) {
    console.error('[Forgot Password] error:', error.message)
    // Jangan expose error spesifik untuk menghindari email enumeration
    redirect('/forgot-password?error=' + encodeURIComponent('Terjadi kesalahan. Pastikan email yang dimasukkan benar.'))
  }

  redirect('/forgot-password?message=' + encodeURIComponent('Tautan reset password telah dikirim ke email Anda.'))
}
