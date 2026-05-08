import { StatsCards } from "@/components/dashboard/StatsCards";
import { FinancialIntelligence } from "@/components/dashboard/FinancialIntelligence";
import { YieldForecast } from "@/components/dashboard/YieldForecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Overview Operasional</h2>
          <p className="text-slate-400">Selamat datang kembali, Monitor kondisi lahan Anda secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4 mr-2" /> Tambah Proyek
          </Button>
        </div>
      </div>

      <StatsCards 
        totalSpent={stats.totalSpent} 
        activeSeasons={stats.activeSeasons} 
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <FinancialIntelligence />
        <YieldForecast />
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">Aktivitas Terakhir (Telegram Feed)</CardTitle>
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
        <CardContent>
          <Table>
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
                    <Badge variant="outline" className={log.status === "Selesai" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500">{log.date}</TableCell>
                </TableRow>
              ))}
              {stats.recentLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    Belum ada aktivitas. Coba input dari Telegram!
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
