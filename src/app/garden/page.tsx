import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_mode')
    .eq('id', user.id)
    .single();

  if (profile?.user_mode === 'pro') {
    redirect('/');
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
    <div className="space-y-4 md:space-y-6 max-w-5xl pb-28 px-4 md:px-0">
      <div className="mb-6 pt-4">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 mb-1 md:mb-2">Beranda Kebun <span className="inline-block animate-bounce ml-2">🪴</span></h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium">Ringkasan kondisi tanaman Anda hari ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-white/60 shadow-soft rounded-2xl md:rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/40 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tanaman</CardTitle>
            <div className="text-xl">🪴</div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 relative z-10">
            <div className="text-3xl md:text-4xl font-black text-agritiva-green tracking-tighter">
              {stats.total_plants} <span className="text-sm md:text-xl font-bold text-slate-400 tracking-normal">Tanaman</span>
            </div>
            <p className="text-[10px] md:text-xs font-semibold text-slate-400 mt-1">Dalam koleksi Anda</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/60 shadow-soft rounded-2xl md:rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/40 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6 pb-2 relative z-10">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perhatian Khusus</CardTitle>
            <div className="text-xl">🚑</div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 relative z-10">
            <div className="text-3xl md:text-4xl font-black text-red-500 tracking-tighter">
              {stats.sick_plants} <span className="text-sm md:text-xl font-bold text-slate-400 tracking-normal">Tanaman</span>
            </div>
            <p className="text-[10px] md:text-xs font-semibold text-slate-400 mt-1">Sakit atau kering</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/60 shadow-soft rounded-2xl md:rounded-3xl mt-4 md:mt-8">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-lg md:text-xl font-bold text-slate-800">Tanaman Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2 md:pt-4">
          {recentPlants && recentPlants.length > 0 ? (
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recentPlants.map((plant) => (
                <Link key={plant.id} href={`/plants/${plant.id}`}>
                  <div className="p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/50 bg-white/40 hover:bg-white/70 transition-all duration-300 shadow-sm hover:shadow-md group h-full">
                    <div className="flex justify-between items-start mb-2 md:mb-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-lg md:text-xl shadow-inner">
                        🌱
                      </div>
                      <span className={cn(
                        "text-[9px] md:text-[10px] px-2 md:px-3 py-1 rounded-full font-bold tracking-wide uppercase shadow-sm",
                        plant.status === 'Sehat' ? 'bg-agritiva-emerald/20 text-agritiva-green' :
                        plant.status === 'Sakit' ? 'bg-red-100 text-red-600' :
                        plant.status === 'Kering' ? 'bg-agritiva-gold/20 text-agritiva-gold' :
                        'bg-slate-100 text-slate-600'
                      )}>
                        {plant.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg text-slate-800 group-hover:text-agritiva-emerald transition-colors">{plant.name}</h3>
                    <p className="text-[10px] md:text-xs font-semibold text-slate-500">{plant.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white/30 rounded-2xl border border-dashed border-slate-300">
              <div className="text-5xl mb-4">🌱</div>
              <p className="text-slate-500 font-medium mb-6">Belum ada tanaman di kebun Anda.</p>
              <Link href="/plants/new">
                <Button className="rounded-full px-8 bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  Tambah Tanaman Baru
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/60 shadow-soft rounded-2xl md:rounded-3xl mt-4 md:mt-8">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-lg md:text-xl font-bold text-slate-800">Tips Berkebun Hari Ini 💡</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-blue-50/80 border border-blue-100 flex gap-3 items-start">
            <div className="text-xl md:text-2xl mt-0.5 md:mt-1">💧</div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-blue-900">Waktu Siram Terbaik</h4>
              <p className="text-xs md:text-sm text-blue-700/80 mt-0.5 md:mt-1 font-medium leading-relaxed">Siram tanaman di pagi hari sebelum jam 9 atau sore hari setelah jam 4 untuk menghindari penguapan cepat.</p>
            </div>
          </div>
          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-orange-50/80 border border-orange-100 flex gap-3 items-start">
            <div className="text-xl md:text-2xl mt-0.5 md:mt-1">☀️</div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-orange-900">Rotasi Pot</h4>
              <p className="text-xs md:text-sm text-orange-700/80 mt-0.5 md:mt-1 font-medium leading-relaxed">Putar pot tanaman indoor Anda 90 derajat setiap minggu agar pertumbuhannya merata ke arah cahaya.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
