"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  History,
  ShoppingCart,
  Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    // 1. Fetch Inventory Items
    const { data } = await supabase.from("inventory").select("*").order("item_name");
    if (data) setItems(data);

    // 2. Fetch Recent Inventory Usage/Purchases (from expenses)
    const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: expData } = await supabase
      .from("expenses")
      .select("*, inventory(item_name)")
      .not("inventory_id", "is", null)
      .order("created_at", { ascending: false });

    if (expData) {
      setLogs(expData);
      
      // Calculate this month's inventory spend
      const spend = expData
        .filter(e => e.created_at.startsWith(currentMonthStr))
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      setMonthlySpend(spend);
    }
    
    setLoading(false);
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Gudang & Inventaris</h2>
          <p className="text-sm md:text-base text-slate-400 mt-1">Kontrol stok saprotan dan monitoring penggunaan material.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <Button variant="outline" className="flex-1 md:flex-none bg-slate-900 border-slate-800 text-slate-300">
            <History className="w-4 h-4 mr-2" /> Log Penggunaan
          </Button>
          <Button className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500">
            <Plus className="w-4 h-4 mr-2" /> Tambah Stok
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Item</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-bold text-white">{items.length}</h3>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Boxes className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800 shadow-xl border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase">Stok Kritis</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-bold text-red-500">
                {items.filter(i => i.quantity <= i.par_level).length}
              </h3>
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase">Belanja Bulan Ini</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-bold text-white">Rp {(monthlySpend / 1000000).toFixed(1)}M</h3>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardContent className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase">Aktivitas Gudang</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-bold text-white">{logs.length}</h3>
              <p className="text-xs text-slate-500 italic">Transaksi Tercatat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isLow = item.quantity <= item.par_level;
          const percentage = Math.min((item.quantity / (item.par_level * 3)) * 100, 100);

          return (
            <Card key={item.id} className={cn(
              "bg-slate-900 border-slate-800 shadow-xl hover:border-slate-700 transition-all group overflow-hidden",
              isLow && "border-red-500/30 bg-red-500/5"
            )}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className={cn("w-4 h-4", isLow ? "text-red-500" : "text-emerald-500")} />
                  {item.item_name}
                </CardTitle>
                {isLow && (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] animate-pulse">
                    RESTOCK
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {item.quantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span>
                    </h3>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Batas Aman: {item.par_level} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Status Kapasitas</p>
                    <Progress value={percentage} className="w-24 h-2 bg-slate-950" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-800/50 flex gap-2">
                  <Button size="sm" variant="ghost" className="flex-1 bg-slate-950 text-[10px] h-8 hover:bg-emerald-500/10 hover:text-emerald-500">
                    <Plus className="w-3 h-3 mr-1" /> Stock In
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 bg-slate-950 text-[10px] h-8 hover:bg-orange-500/10 hover:text-orange-500">
                    <ArrowDownRight className="w-3 h-3 mr-1" /> Use Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {items.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <Package className="w-12 h-12 text-slate-800 mx-auto" />
            <p className="text-slate-600 italic">Gudang kosong. Mulai masukkan inventaris saprotan.</p>
            <Button onClick={() => {}} className="bg-emerald-600">Initial Setup Stok</Button>
          </div>
        )}
      </div>

      {/* Usage History (Simplified) */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 bg-slate-900/50">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Log Aktivitas Gudang Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waktu</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Item</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jumlah</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">PIC</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 text-xs text-slate-400">
                    {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 text-xs">
                    {log.amount > 0 ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/10">IN (Beli)</Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/10">OUT (Pakai)</Badge>
                    )}
                  </td>
                  <td className="p-4 text-xs font-bold text-white">{(log.inventory as any)?.item_name || 'Item'}</td>
                  <td className="p-4 text-xs text-white">Rp {Math.abs(log.amount).toLocaleString('id-ID')}</td>
                  <td className="p-4 text-xs text-slate-400">{log.submitted_by || 'Field Officer'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-600 italic">Belum ada aktivitas gudang tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
