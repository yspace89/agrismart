import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Leaf, TrendingUp, Package, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  totalSpent: number;
  activeSeasons: number;
  targetYield: number;
  inventoryTotal: number;
  inventoryCritical: number;
}

export function StatsCards({ totalSpent, activeSeasons, targetYield, inventoryTotal, inventoryCritical }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Pengeluaran",
      value: `Rp ${totalSpent.toLocaleString("id-ID")}`,
      description: "Akumulasi semua pengeluaran",
      icon: Banknote,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      alert: false,
    },
    {
      title: "Estimasi Hasil Panen",
      value: targetYield > 0 ? `${targetYield} Ton` : "Belum Diset",
      description: targetYield > 0 ? "Target produksi musim ini" : "Set di halaman Lahan",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      alert: false,
    },
    {
      title: "Lahan Aktif",
      value: `${activeSeasons} Petak`,
      description: "Lahan dalam siklus tanam",
      icon: Leaf,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      alert: false,
    },
    {
      title: "Stok Gudang",
      value: inventoryTotal > 0 ? `${inventoryTotal} Item` : "Belum Ada",
      description: inventoryCritical > 0 ? `⚠ ${inventoryCritical} item di bawah par` : "Semua stok aman",
      icon: inventoryCritical > 0 ? AlertTriangle : Package,
      color: inventoryCritical > 0 ? "text-red-500" : "text-purple-500",
      bg: inventoryCritical > 0 ? "bg-red-500/10" : "bg-purple-500/10",
      alert: inventoryCritical > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`bg-slate-900 border-slate-800 shadow-xl overflow-hidden group relative ${
            stat.alert ? "border-red-500/30 bg-red-500/5" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tracking-tight ${stat.alert ? "text-red-400" : "text-white"}`}>
              {stat.value}
            </div>
            <p className={`text-xs mt-1 ${stat.alert ? "text-red-400" : "text-slate-500"}`}>
              {stat.description}
            </p>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
