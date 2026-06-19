import { updatePassword } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-md border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Perbarui Password
          </CardTitle>
          <CardDescription className="text-slate-500">
            Silakan masukkan password baru Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePassword} className="space-y-4">
            {resolvedParams?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {resolvedParams.error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password Baru</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-slate-700">Konfirmasi Password Baru</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full"
              />
            </div>

            <Button type="submit" className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white">
              Simpan Password Baru
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
