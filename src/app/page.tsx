import { StatsCards } from "@/components/dashboard/StatsCards";
import { FinancialIntelligence } from "@/components/dashboard/FinancialIntelligence";
import { YieldForecast } from "@/components/dashboard/YieldForecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getYieldForecastData } from "@/lib/data";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_mode')
      .eq('id', user.id)
      .single();

    if (profile?.user_mode === 'garden') {
      redirect('/garden');
    }
  }

  const [stats, forecastData] = await Promise.all([
    getDashboardStats(),
    getYieldForecastData(),
  ]);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Overview Operasional</h2>
          <p className="text-sm md:text-base text-slate-400 mt-1">
            Selamat datang kembali. Monitor kondisi lahan Anda secara real-time.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <Button variant="outline" className="flex-1 md:flex-none bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4 mr-2" /> Tambah Proyek
          </Button>
        </div>
      </div>

      {/* Stats Cards — semua dari database */}
      <StatsCards
        totalSpent={stats.totalSpent}
        activeSeasons={stats.activeSeasons}
        targetYield={stats.primarySeason?.targetYield ?? 0}
        inventoryTotal={stats.inventory.totalItems}
        inventoryCritical={stats.inventory.criticalCount}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Financial Intelligence — data nyata dari season aktif */}
        <FinancialIntelligence
          budget={stats.primarySeason?.budget ?? 0}
          spent={stats.primarySeason?.spent ?? 0}
          dailyBurnRate={stats.primarySeason?.dailyBurnRate ?? 0}
          estimatedDaysRemaining={stats.primarySeason?.estimatedDaysRemaining ?? null}
          harvestDate={stats.primarySeason?.harvestDate ?? null}
          cropName={stats.primarySeason?.cropName}
        />
        {/* Yield Forecast — dari growth_logs nyata */}
        <YieldForecast
          chartData={forecastData.chartData as any}
          probability={forecastData.probability}
          targetYield={stats.primarySeason?.targetYield ?? 0}
          actualYield={stats.primarySeason?.actualYield ?? 0}
          cropName={stats.primarySeason?.cropName}
        />
      </div>

      {/* Activity Feed */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">Aktivitas Terakhir (Feed Lapangan)</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Catatan aktivitas dan laporan harian</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari aktivitas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-slate-400">Lokasi/Petak</TableHead>
                <TableHead className="text-slate-400">Aktivitas</TableHead>
                <TableHead className="text-slate-400">Petugas</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentLogs.map((log) => (
                <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-200">{log.petak}</TableCell>
                  <TableCell className="text-slate-400">{log.activity}</TableCell>
                  <TableCell className="text-slate-400">{log.user}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.status === "Selesai"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500">{log.date}</TableCell>
                </TableRow>
              ))}
              {stats.recentLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    Belum ada aktivitas yang dicatat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
