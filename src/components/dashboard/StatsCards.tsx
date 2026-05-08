import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Leaf, TrendingUp, Package } from "lucide-react";

export function StatsCards({ totalSpent, activeSeasons }: { totalSpent: number, activeSeasons: number }) {
  const stats = [
    {
      title: "Total Pengeluaran",
      value: `Rp ${totalSpent.toLocaleString('id-ID')}`,
      description: "Total real-time",
      icon: Banknote,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Estimasi Hasil",
      value: "14.2 Ton",
      description: "Proyeksi Panen Q2",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Lahan Aktif",
      value: `${activeSeasons} Petak`,
      description: "Lahan dalam siklus",
      icon: Leaf,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Stok Gudang",
      value: "85%",
      description: "2 item di bawah par",
      icon: Package,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
