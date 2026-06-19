import Link from 'next/link'
import { resetPassword } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string }>
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-aesthetic-mesh">
      {/* Decorative floating blobs (Gen Z vibe) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none opacity-60 mix-blend-multiply" style={{background: 'radial-gradient(circle, #b7e4c7 0%, transparent 70%)'}} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-60 mix-blend-multiply" style={{background: 'radial-gradient(circle, #f5d4be 0%, transparent 70%)'}} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none opacity-40 mix-blend-multiply" style={{background: 'radial-gradient(circle, #c8e1ff 0%, transparent 70%)'}} />
      
      {/* Logo mark */}
      <div className="z-10 mb-8 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40" style={{background: 'linear-gradient(135deg, #40916c, #e09e7e)'}} />
          <div className="relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-soft glass-panel-heavy" style={{background: 'linear-gradient(135deg, #1b4332 20%, #40916c 100%)'}}>
            <span className="text-white font-black text-3xl tracking-tighter select-none">A</span>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-soft z-10 glass-panel-heavy border-white/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-2 pb-6 pt-8">
          <CardTitle className="text-2xl font-black text-slate-800 text-center tracking-tight">Lupa Password?</CardTitle>
          <CardDescription className="text-center text-slate-500 font-medium">
            Masukkan email Anda untuk menerima tautan reset
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-8 pb-10">
          <form action={resetPassword} className="space-y-5">
            {resolvedParams?.error && (
              <div className="p-4 mb-2 rounded-2xl bg-red-50/80 border border-red-100 flex gap-3 items-start text-sm text-red-600">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="font-medium mt-0.5">{resolvedParams.error}</p>
              </div>
            )}
            
            {resolvedParams?.message && (
              <div className="p-4 mb-2 rounded-2xl flex gap-3 items-start text-sm bg-[#52b788]/10 border border-[#52b788]/20 text-[#1b4332]">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2d6a4f]" />
                <p className="font-medium mt-0.5">{resolvedParams.message}</p>
              </div>
            )}
            
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@agritiva.com"
                required
                className="bg-white/70 border-white/80 h-14 rounded-2xl px-5 text-slate-900 placeholder:text-slate-400 focus:border-[#40916c] focus:ring-[#40916c] shadow-sm transition-all"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full text-white font-bold text-base h-14 rounded-2xl mt-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #1b4332, #40916c)',
                boxShadow: '0 10px 25px -5px rgba(64,145,108,0.4)'
              }}
            >
              Kirim Tautan Reset
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Ingat password Anda?{' '}
            <Link href="/login" className="font-bold text-[#2d6a4f] transition-colors hover:text-[#1b4332]">
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-auto pt-12 text-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
        &copy; {new Date().getFullYear()} Agritiva
      </div>
    </div>
  )
}
