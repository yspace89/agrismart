import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ShoppingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // We reuse the expenses table but present it as "Belanjaan Kebun"
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  const totalBelanja = expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Belanjaan Kebun <span className="inline-block hover:animate-bounce ml-1">🛒</span></h1>
          <p className="text-slate-500 font-medium">Catat pembelian bibit, pot, pupuk, dan perlengkapan lainnya.</p>
        </div>
        <Button className="rounded-full px-6 bg-[#1b4332] hover:bg-[#2d6a4f] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <Plus className="w-5 h-5 mr-1" />
          <span className="hidden md:inline">Catat Belanja</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel border-white/60 shadow-soft rounded-3xl md:col-span-1 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/40 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</CardTitle>
            <div className="text-2xl">💸</div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-[#1b4332] tracking-tighter">
              Rp {totalBelanja.toLocaleString('id-ID')}
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Seluruh waktu</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/60 shadow-soft rounded-3xl mt-8">
        <CardHeader className="pb-4 border-b border-white/50">
          <CardTitle className="text-xl font-bold text-slate-800">Riwayat Belanja 📝</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {expenses && expenses.length > 0 ? (
            <div className="rounded-2xl border border-white/50 bg-white/40 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left text-slate-700">
                <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-white/50 border-b border-white/50">
                  <tr>
                    <th className="px-5 py-4 font-bold">Tanggal</th>
                    <th className="px-5 py-4 font-bold">Barang/Keterangan</th>
                    <th className="px-5 py-4 font-bold">Kategori</th>
                    <th className="px-5 py-4 font-bold text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-white/60 transition-colors duration-200">
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-600">
                        {new Date(expense.date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{expense.description}</td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 shadow-sm border border-white/50">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-red-500 tracking-tight">
                        Rp {expense.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white/30 rounded-2xl border border-dashed border-slate-300">
              <div className="text-5xl mb-4 opacity-50">🛒</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Belum ada catatan belanja</h3>
              <p className="text-sm font-medium text-slate-500 mb-6 max-w-md mx-auto">Catat pembelian bibit, pot, atau media tanam Anda di sini untuk melacak pengeluaran.</p>
              <Button className="rounded-full px-6 bg-[#1b4332] hover:bg-[#2d6a4f] text-white shadow-md">
                Catat Pengeluaran Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
