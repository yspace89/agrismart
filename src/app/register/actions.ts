'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  // Supabase by default will sign the user in after sign up if email confirmations are turned off.
  // If email confirmations are on, it will send an email. For this local project, we'll assume it succeeds.
  redirect('/login?message=' + encodeURIComponent('Registrasi berhasil! Silakan login.'))
}
