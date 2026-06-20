import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    <div className="space-y-4 md:space-y-6 max-w-5xl pb-28 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6 pt-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 mb-1 md:mb-2">Belanjaan Kebun <span className="inline-block hover:animate-bounce ml-1">🛒</span></h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">Catat pembelian bibit, pot, pupuk, dan perlengkapan lainnya.</p>
        </div>
        <Link href="/plants/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto rounded-xl md:rounded-full px-6 bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <Plus className="w-5 h-5 mr-1" />
            <span>Catat Belanja</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel border-white/60 shadow-soft rounded-2xl md:rounded-3xl md:col-span-1 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/40 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</CardTitle>
            <div className="text-xl">💸</div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 relative z-10">
            <div className="text-2xl md:text-3xl font-black text-agritiva-green tracking-tighter">
              Rp {totalBelanja.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] md:text-xs font-semibold text-slate-400 mt-1">Seluruh waktu</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/60 shadow-soft rounded-2xl md:rounded-3xl mt-4 md:mt-8">
        <CardHeader className="p-4 md:p-6 pb-4 border-b border-white/50">
          <CardTitle className="text-lg md:text-xl font-bold text-slate-800">Riwayat Belanja 📝</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-4 overflow-x-auto">
          {expenses && expenses.length > 0 ? (
            <div className="rounded-xl md:rounded-2xl border border-white/50 bg-white/40 overflow-hidden shadow-sm min-w-[500px]">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 bg-white/50 border-b border-white/50">
                  <tr>
                    <th className="px-3 md:px-5 py-2.5 md:py-4 font-bold">Tanggal</th>
                    <th className="px-3 md:px-5 py-2.5 md:py-4 font-bold">Barang/Keterangan</th>
                    <th className="px-3 md:px-5 py-2.5 md:py-4 font-bold">Kategori</th>
                    <th className="px-3 md:px-5 py-2.5 md:py-4 font-bold text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-white/60 transition-colors duration-200">
                      <td className="px-3 md:px-5 py-3 md:py-4 whitespace-nowrap font-medium text-slate-600">
                        {new Date(expense.date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-3 md:px-5 py-3 md:py-4 font-semibold text-slate-800 line-clamp-2 md:line-clamp-none">{expense.description}</td>
                      <td className="px-3 md:px-5 py-3 md:py-4">
                        <span className="px-2 md:px-3 py-1 rounded-md md:rounded-full text-[9px] md:text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 shadow-sm border border-white/50">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-3 md:px-5 py-3 md:py-4 text-right font-black text-red-500 tracking-tight whitespace-nowrap">
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
              <Link href="/plants/new">
                <Button className="rounded-full px-6 bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-md">
                  Catat Pengeluaran Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
