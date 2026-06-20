'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const fullName = formData.get('full_name') as string
  const phoneNumber = formData.get('phone_number') as string
  const location = formData.get('location') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: fullName,
      phone_number: phoneNumber,
      location: location,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Update profile error:', error)
    redirect('/profile?error=Gagal+memperbarui+profil.+Silakan+coba+lagi.')
  }

  revalidatePath('/profile')
  revalidatePath('/')
  redirect('/profile?success=Profil+berhasil+diperbarui.')
}

export async function updatePassword(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    redirect('/profile?error=Password+baru+dan+konfirmasi+password+tidak+cocok.')
  }

  if (newPassword.length < 6) {
    redirect('/profile?error=Password+minimal+6+karakter.')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Update password error:', error)
    redirect('/profile?error=Gagal+mengubah+password.+Pastikan+password+memenuhi+kriteria.')
  }

  redirect('/profile?success=Password+berhasil+diubah.')
}
