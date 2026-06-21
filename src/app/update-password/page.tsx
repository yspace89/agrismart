import { updatePassword } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from '@/components/ui/submit-button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { AlertCircle } from 'lucide-react'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-aesthetic-mesh">
      {/* Decorative floating blobs (Gen Z vibe) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none opacity-60 mix-blend-multiply" style={{background: 'radial-gradient(circle, #b7e4c7 0%, transparent 70%)'}} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-60 mix-blend-multiply" style={{background: 'radial-gradient(circle, #f5d4be 0%, transparent 70%)'}} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none opacity-40 mix-blend-multiply" style={{background: 'radial-gradient(circle, #c8e1ff 0%, transparent 70%)'}} />
      


      <Card className="w-full max-w-md shadow-soft z-10 glass-panel-heavy border-white/50 rounded-2xl overflow-hidden mt-8 md:mt-0">
        <CardHeader className="space-y-1 pb-6 pt-8 flex flex-col items-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Agritiva Logo" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-800 text-center tracking-tight">Update Password</CardTitle>
          <CardDescription className="text-center text-slate-500 font-medium">
            Masukkan kombinasi rahasia baru Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-8 pb-10">
          <form action={updatePassword} className="space-y-5">
            {resolvedParams?.error && (
              <div className="p-4 mb-2 rounded-2xl bg-red-50/80 border border-red-100 flex gap-3 items-start text-sm text-red-600">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="font-medium mt-0.5">{resolvedParams.error}</p>
              </div>
            )}
            
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="password">
                Password Baru
              </label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-white/70 border-white/80 h-12 rounded-xl px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#40916c] focus:ring-[#40916c] shadow-sm transition-all"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="confirm_password">
                Konfirmasi Password
              </label>
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-white/70 border-white/80 h-12 rounded-xl px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#40916c] focus:ring-[#40916c] shadow-sm transition-all"
              />
            </div>

            <SubmitButton 
              pendingText="Menyimpan..."
              className="w-full text-white font-bold text-sm h-12 rounded-xl mt-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #1b4332, #10b981)',
                boxShadow: '0 10px 25px -5px rgba(64,145,108,0.4)'
              }}
            >
              Simpan Password
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-auto pt-12 text-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
        &copy; {new Date().getFullYear()} Agritiva
      </div>
    </div>
  )
}
