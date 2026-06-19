import Link from 'next/link'
import { resetPassword } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string }>
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-md border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Lupa Password
          </CardTitle>
          <CardDescription className="text-slate-500">
            Masukkan email Anda untuk menerima tautan reset password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={resetPassword} className="space-y-4">
            {resolvedParams?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {resolvedParams.error}
              </div>
            )}
            {resolvedParams?.message && (
              <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                {resolvedParams.message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="petani@agritiva.com"
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white">
              Kirim Tautan Reset
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 bg-slate-50/50 rounded-b-xl">
          <p className="text-sm text-slate-600">
            Ingat password Anda?{' '}
            <Link href="/login" className="text-[#2d6a4f] font-semibold hover:underline">
              Kembali ke Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
