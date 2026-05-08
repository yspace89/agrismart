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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data } = await supabase.from("inventory").select("*").order("item_name");
    if (data) setItems(data);
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Gudang & Inventaris</h2>
          <p className="text-slate-400">Kontrol stok saprotan dan monitoring penggunaan material.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300">
            <History className="w-4 h-4 mr-2" /> Log Penggunaan
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500">
            <Plus className="w-4 h-4 mr-2" /> Tambah Stok Baru
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
              <h3 className="text-2xl font-bold text-white">Rp 8.4M</h3>
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
              <h3 className="text-2xl font-bold text-white">12</h3>
              <p className="text-xs text-slate-500 italic">24 jam terakhir</p>
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
        <CardContent className="p-0">
          <table className="w-full text-left">
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
              <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="p-4 text-xs text-slate-400">9 Mei, 08:30</td>
                <td className="p-4 text-xs"><Badge className="bg-orange-500/10 text-orange-500 border-orange-500/10">OUT</Badge></td>
                <td className="p-4 text-xs font-bold text-white">Pupuk Urea</td>
                <td className="p-4 text-xs text-white">2 Karung</td>
                <td className="p-4 text-xs text-slate-400">Sudirman (Blok A-01)</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="p-4 text-xs text-slate-400">8 Mei, 14:15</td>
                <td className="p-4 text-xs"><Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/10">IN</Badge></td>
                <td className="p-4 text-xs font-bold text-white">Bibit Jagung P35</td>
                <td className="p-4 text-xs text-white">10 Pack</td>
                <td className="p-4 text-xs text-slate-400">Supplier A</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
