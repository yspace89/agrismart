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
    <div className="space-y-6 max-w-5xl pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Tanamanku <span className="inline-block hover:animate-spin ml-1">🪴</span></h1>
          <p className="text-slate-500 font-medium">Daftar koleksi tanaman di kebun Anda.</p>
        </div>
        
        <Link href="/plants/new">
          <Button className="rounded-full px-6 bg-[#1b4332] hover:bg-[#2d6a4f] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <Plus className="w-5 h-5 mr-1" />
            <span className="hidden md:inline">Tambah Tanaman</span>
          </Button>
        </Link>
      </div>

      {plants && plants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <Card className="glass-panel border-white/60 hover:border-white shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full cursor-pointer group rounded-3xl overflow-hidden relative">
                <CardContent className="p-6 flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/60 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {plant.type === 'Sayuran' ? '🥬' : 
                       plant.type === 'Buah' ? '🍎' : 
                       plant.type === 'Bunga' ? '🌸' : 
                       plant.type === 'Herbal' ? '🌿' : '🪴'}
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm ${
                      plant.status === 'Sehat' ? 'bg-[#52b788]/20 text-[#2d6a4f]' :
                      plant.status === 'Sakit' ? 'bg-red-100 text-red-600' :
                      plant.status === 'Kering' ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {plant.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-xl font-black text-slate-800 group-hover:text-[#1b4332] transition-colors">{plant.name}</h3>
                    <p className="text-sm font-semibold text-slate-500">{plant.species || plant.type}</p>
                  </div>
                  
                  <div className="mt-auto pt-5 flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5 bg-amber-50/80 px-2 py-1 rounded-md text-amber-700">
                      <Sun className="w-3.5 h-3.5" />
                      {plant.light_requirement || '?'}
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50/80 px-2 py-1 rounded-md text-blue-700">
                      <Droplet className="w-3.5 h-3.5" />
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
            <Button className="rounded-full px-8 h-12 text-base bg-[#1b4332] hover:bg-[#2d6a4f] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              Tambah Tanaman Pertama
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
