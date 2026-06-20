import { createClient } from '@/lib/supabase-server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Leaf, Sun, Droplet } from 'lucide-react';
import Link from 'next/link';

export default async function PlantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl pb-28 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6 pt-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 mb-1 md:mb-2">Tanamanku <span className="inline-block hover:animate-spin ml-1">🪴</span></h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">Daftar koleksi tanaman di kebun Anda.</p>
        </div>
        
        <Link href="/plants/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto rounded-xl md:rounded-full px-6 bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <Plus className="w-5 h-5 mr-1" />
            <span>Tambah Tanaman</span>
          </Button>
        </Link>
      </div>

      {plants && plants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <Card className="glass-panel border-white/60 hover:border-white shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full cursor-pointer group rounded-2xl md:rounded-3xl overflow-hidden relative">
                <CardContent className="p-4 md:p-6 flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-3 md:mb-5">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/60 shadow-sm flex items-center justify-center text-xl md:text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {plant.type === 'Sayuran' ? '🥬' : 
                       plant.type === 'Buah' ? '🍎' : 
                       plant.type === 'Bunga' ? '🌸' : 
                       plant.type === 'Herbal' ? '🌿' : '🪴'}
                    </div>
                    <span className={`text-[9px] md:text-[10px] px-2 md:px-3 py-1 md:py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm ${
                      plant.status === 'Sehat' ? 'bg-agritiva-emerald/20 text-agritiva-green' :
                      plant.status === 'Sakit' ? 'bg-red-100 text-red-600' :
                      plant.status === 'Kering' ? 'bg-agritiva-gold/20 text-agritiva-gold' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {plant.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 group-hover:text-agritiva-emerald transition-colors">{plant.name}</h3>
                    <p className="text-xs md:text-sm font-semibold text-slate-500">{plant.species || plant.type}</p>
                  </div>
                  
                  <div className="mt-auto pt-3 md:pt-5 flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-semibold text-slate-600 flex-wrap">
                    <div className="flex items-center gap-1 md:gap-1.5 bg-amber-50/80 px-2 py-1 rounded-md text-amber-700">
                      <Sun className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      {plant.light_requirement || '?'}
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5 bg-blue-50/80 px-2 py-1 rounded-md text-blue-700">
                      <Droplet className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      Tiap {plant.water_frequency_days} hr
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white/40 glass-panel border-white/60 shadow-soft rounded-3xl">
          <div className="text-6xl mb-6">🌱</div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Belum ada tanaman</h3>
          <p className="mb-8 text-slate-500 font-medium max-w-md mx-auto">Mulai tambahkan koleksi tanaman pertama Anda ke dalam sistem.</p>
          <Link href="/plants/new">
            <Button className="rounded-full px-8 h-12 text-base bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              Tambah Tanaman Pertama
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
