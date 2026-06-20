import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Button } from '@/components/ui/button'
import { User, Phone, MapPin, KeyRound, AlertCircle, CheckCircle } from 'lucide-react'
import { updateProfile, updatePassword } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const resolvedParams = await searchParams;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Pengaturan Profil</h2>
        <p className="text-sm md:text-base text-slate-500 mt-1">
          Kelola informasi pribadi dan keamanan akun Agritiva Anda.
        </p>
      </div>

      {resolvedParams.success && (
        <div className="p-4 rounded-2xl flex gap-3 items-start text-sm bg-emerald-50 border border-emerald-100 text-emerald-800 shadow-sm">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <p className="font-medium mt-0.5">{resolvedParams.success}</p>
        </div>
      )}

      {resolvedParams.error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-3 items-start text-sm text-red-600 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="font-medium mt-0.5">{resolvedParams.error}</p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 items-start">
        {/* Informasi Akun */}
        <Card className="shadow-soft border-slate-200/60 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6">
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Informasi Pribadi
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Data ini digunakan untuk laporan dan notifikasi WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 pb-6">
            <form action={updateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="email">
                  Email (Tidak bisa diubah)
                </label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="bg-slate-50 border-slate-200 h-11 rounded-xl px-4 text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1" htmlFor="full_name">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    defaultValue={profile?.full_name || ''}
                    placeholder="Nama Lengkap Anda"
                    required
                    className="pl-10 bg-white border-slate-200 h-11 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1" htmlFor="phone_number">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    defaultValue={profile?.phone_number || ''}
                    placeholder="Contoh: 08123456789"
                    className="pl-10 bg-white border-slate-200 h-11 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1" htmlFor="location">
                  Kota / Lokasi Lahan
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    defaultValue={profile?.location || ''}
                    placeholder="Contoh: Lembang, Bandung Barat"
                    className="pl-10 bg-white border-slate-200 h-11 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full text-white font-bold h-11 rounded-xl mt-4 bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
              >
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Keamanan Akun */}
        <Card className="shadow-soft border-slate-200/60 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6">
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" /> Keamanan Akun
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Ganti password untuk menjaga keamanan akun Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 pb-6">
            <form action={updatePassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1" htmlFor="new_password">
                  Password Baru
                </label>
                <PasswordInput
                  id="new_password"
                  name="new_password"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="bg-white border-slate-200 h-11 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1" htmlFor="confirm_password">
                  Konfirmasi Password Baru
                </label>
                <PasswordInput
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="Ulangi password baru"
                  required
                  minLength={6}
                  className="bg-white border-slate-200 h-11 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <Button 
                type="submit" 
                variant="outline"
                className="w-full font-bold h-11 rounded-xl mt-4 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-all"
              >
                Ganti Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
