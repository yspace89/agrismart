import { login } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Leaf } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const resolvedParams = await searchParams;
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      
      <div className="z-10 mb-8 flex flex-col items-center">
        <div className="p-3 bg-emerald-500/10 rounded-xl mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <Leaf className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AgriSmart</h1>
        <p className="text-slate-400 mt-2">Enterprise Farm Management System</p>
      </div>

      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl z-10">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-white text-center">Login</CardTitle>
          <CardDescription className="text-slate-400 text-center">
            Masukkan email dan password untuk masuk ke dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            {resolvedParams.error && (
              <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2 items-start text-sm text-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p>{resolvedParams.error}</p>
              </div>
            )}
            
            {resolvedParams.message && (
              <div className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-start text-sm text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p>{resolvedParams.message}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@perusahaan.com"
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 mt-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Belum punya akun?{' '}
            <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-sm text-slate-500 z-10">
        &copy; {new Date().getFullYear()} AgriSmart ERP. All rights reserved.
      </p>
    </div>
  )
}
