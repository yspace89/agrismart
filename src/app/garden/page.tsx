import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, ThermometerSun, AlertTriangle, Bug } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function GardenDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .order('created_at', { ascending: false });

  const stats = {
    total_plants: plants?.length || 0,
    sick_plants: plants?.filter(p => p.status === 'Sakit' || p.status === 'Kering').length || 0,
  };

  const recentPlants = plants?.slice(0, 6);

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Beranda Kebun <span className="inline-block animate-bounce ml-2">🪴</span></h1>
        <p className="text-slate-500 font-medium">Ringkasan kondisi tanaman Anda hari ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-white/60 shadow-soft rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/40 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Tanaman</CardTitle>
            <div className="text-2xl">🪴</div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-[#1b4332] tracking-tighter">
              {stats.total_plants} <span className="text-xl font-bold text-slate-400 tracking-normal">Tanaman</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Dalam koleksi Anda</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/60 shadow-soft rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/40 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Perhatian Khusus</CardTitle>
            <div className="text-2xl">🚑</div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-red-500 tracking-tighter">
              {stats.sick_plants} <span className="text-xl font-bold text-slate-400 tracking-normal">Tanaman</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sakit atau kering</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/60 shadow-soft rounded-3xl mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Tanaman Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPlants && recentPlants.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentPlants.map((plant) => (
                <Link key={plant.id} href={`/plants/${plant.id}`}>
                  <div className="p-5 rounded-2xl border border-white/50 bg-white/40 hover:bg-white/70 transition-all duration-300 shadow-sm hover:shadow-md group h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shadow-inner">
                        🌱
                      </div>
                      <span className={cn(
                        "text-[10px] px-3 py-1 rounded-full font-bold tracking-wide uppercase shadow-sm",
                        plant.status === 'Sehat' ? 'bg-[#52b788]/20 text-[#2d6a4f]' :
                        plant.status === 'Sakit' ? 'bg-red-100 text-red-600' :
                        plant.status === 'Kering' ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-600'
                      )}>
                        {plant.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-[#1b4332] transition-colors">{plant.name}</h3>
                    <p className="text-xs font-semibold text-slate-500">{plant.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white/30 rounded-2xl border border-dashed border-slate-300">
              <div className="text-5xl mb-4">🌱</div>
              <p className="text-slate-500 font-medium mb-6">Belum ada tanaman di kebun Anda.</p>
              <Link href="/plants/new">
                <Button className="rounded-full px-8 bg-[#1b4332] hover:bg-[#2d6a4f] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  Tambah Tanaman Baru
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/60 shadow-soft rounded-3xl mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">Tips Berkebun Hari Ini 💡</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex gap-4 items-start">
            <div className="text-2xl mt-1">💧</div>
            <div>
              <h4 className="font-bold text-blue-900">Waktu Siram Terbaik</h4>
              <p className="text-sm text-blue-700/80 mt-1 font-medium">Siram tanaman di pagi hari sebelum jam 9 atau sore hari setelah jam 4 untuk menghindari penguapan cepat.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-100 flex gap-4 items-start">
            <div className="text-2xl mt-1">☀️</div>
            <div>
              <h4 className="font-bold text-orange-900">Rotasi Pot</h4>
              <p className="text-sm text-orange-700/80 mt-1 font-medium">Putar pot tanaman indoor Anda 90 derajat setiap minggu agar pertumbuhannya merata ke arah cahaya.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
