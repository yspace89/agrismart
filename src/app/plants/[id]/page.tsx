import { createClient } from '@/lib/supabase-server';
import PlantDetailClient from './PlantDetailClient';

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const plantId = resolvedParams.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Get plant details
  const { data: plant } = await supabase
    .from('plants')
    .select('*')
    .eq('id', plantId)
    .single();

  if (!plant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-400">Tanaman tidak ditemukan 🥀</h1>
      </div>
    );
  }

  // Get plant logs
  const { data: logs } = await supabase
    .from('plant_logs')
    .select('*')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false });

  return (
    <PlantDetailClient plant={plant} logs={logs || []} />
  );
}
