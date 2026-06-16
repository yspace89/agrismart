"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Banknote, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart as PieChartIcon, 
  Calendar,
  Receipt,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function FinancePage() {
  const [financials, setFinancials] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState({ 
    totalSpent: 0, 
    totalBudget: 0, 
    avgBurnRate: 0, 
    avgDaysRemaining: 0 
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  async function fetchFinanceData() {
    // 1. Fetch Season Financials View
    const { data: viewData } = await supabase.from("v_season_financials").select("*");
    if (viewData) {
      setFinancials(viewData);
      const totalS = viewData.reduce((acc, curr) => acc + curr.total_spent, 0);
      const totalB = viewData.reduce((acc, curr) => acc + curr.budget_total, 0);
      
      const activeProjects = viewData.filter(v => v.status === 'ongoing');
      const avgBurn = activeProjects.length > 0 
        ? activeProjects.reduce((acc, curr) => acc + (curr.daily_burn_rate || 0), 0) / activeProjects.length 
        : 0;
      
      const validDaysRemaining = activeProjects.filter(v => v.estimated_days_remaining !== null);
      const avgDays = validDaysRemaining.length > 0
        ? validDaysRemaining.reduce((acc, curr) => acc + curr.estimated_days_remaining, 0) / validDaysRemaining.length
        : 0;

      setStats({ totalSpent: totalS, totalBudget: totalB, avgBurnRate: avgBurn, avgDaysRemaining: Math.round(avgDays) });
    }

    // 2. Fetch Recent Transactions
    const { data: expData } = await supabase
      .from("expenses")
      .select("*, planting_seasons(crop_name)")
      .order("created_at", { ascending: false })
      .limit(10);
    if (expData) setRecentExpenses(expData);
  }

  // Calculate Category Breakdown for Chart
  const categoryData = recentExpenses.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Financial Intelligence</h2>
          <p className="text-slate-400">Monitoring cashflow, burn-rate, dan profitabilitas project.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300">
            <Calendar className="w-4 h-4 mr-2" /> Q2 2026
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500">
            <Receipt className="w-4 h-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Banknote className="w-6 h-6 text-emerald-500" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Terpakai</p>
              <h3 className="text-2xl font-bold text-white mt-1">Rp {stats.totalSpent.toLocaleString('id-ID')}</h3>
              <p className="text-xs text-slate-600 mt-1">Dari total budget Rp {stats.totalBudget.toLocaleString('id-ID')}</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Sisa Budget</p>
              <h3 className="text-2xl font-bold text-white mt-1">Rp {(stats.totalBudget - stats.totalSpent).toLocaleString('id-ID')}</h3>
              <p className="text-xs text-slate-600 mt-1">Estimasi sisa operasional {stats.avgDaysRemaining > 0 ? stats.avgDaysRemaining : '?'} hari</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <TrendingDown className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Burn Rate Harian</p>
              <h3 className="text-2xl font-bold text-white mt-1">Rp {Math.round(stats.avgBurnRate).toLocaleString('id-ID')}</h3>
              <p className="text-xs text-slate-500 mt-1 italic">Rata-rata project aktif</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Burn Rate Chart */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 bg-slate-900/50">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              Project Burn-Rate Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {financials.map((project) => (
                <div key={project.season_id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold text-white">{project.crop_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">Season ID: {project.season_id.slice(0,8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{project.burn_rate_percent.toFixed(1)}%</p>
                      <p className="text-[10px] text-slate-500 uppercase">Budget Terpakai</p>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 ease-out",
                        project.burn_rate_percent > 80 ? "bg-red-500" : project.burn_rate_percent > 50 ? "bg-orange-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${project.burn_rate_percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase">
                    <span>Rp 0</span>
                    <span>Rp {project.budget_total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
              {financials.length === 0 && <p className="text-center py-10 text-slate-500">Belum ada project aktif.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Expense Category Chart */}
        <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 bg-slate-900/50">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-500" />
              Alokasi Biaya
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="p-6 space-y-3">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                    {cat.name}
                  </div>
                  <span className="text-xs font-bold text-white">Rp {cat.value.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 bg-slate-900/50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-white">Buku Kas (Digital Ledger)</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Cari transaksi..." className="pl-9 bg-slate-950 border-slate-800" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Project</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kategori</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Keterangan</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((exp) => (
                <tr key={exp.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-sm text-slate-400">{new Date(exp.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 text-sm font-bold text-white">{(exp.planting_seasons as any)?.crop_name || 'General'}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/10">
                      {exp.category}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-slate-400 italic">"{exp.description}"</td>
                  <td className="p-4 text-sm font-bold text-white text-right">Rp {exp.amount.toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {recentExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-600 italic">Belum ada transaksi tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
