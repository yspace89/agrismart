"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown } from "lucide-react";

export function FinancialIntelligence() {
  const budget = 25000000;
  const spent = 12500000;
  const percent = (spent / budget) * 100;
  const daysRemaining = 18;
  const daysUntilHarvest = 22;

  const isAtRisk = daysRemaining < daysUntilHarvest;

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white">Financial Intelligence</CardTitle>
            <CardDescription className="text-slate-500">Burn-rate vs Harvest Timeline</CardDescription>
          </div>
          {isAtRisk ? (
            <Badge variant="destructive" className="animate-pulse bg-red-500/20 text-red-500 border-red-500/50">
              <AlertCircle className="w-3 h-3 mr-1" /> Krisis Cashflow
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50">Aman</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Budget Terpakai</span>
            <span className="text-white font-medium">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2 bg-slate-800" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Rp {spent.toLocaleString('id-ID')}</span>
            <span>Total Rp {budget.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase">Sisa Umur Dana</p>
            <p className="text-2xl font-bold text-orange-500">{daysRemaining} Hari</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase">Estimasi Panen</p>
            <p className="text-2xl font-bold text-emerald-500">{daysUntilHarvest} Hari</p>
          </div>
        </div>

        {isAtRisk && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3 items-start">
            <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-xs text-red-200">
              Dana operasional diprediksi habis <span className="font-bold text-white">4 hari sebelum panen</span>. Disarankan melakukan efisiensi atau penambahan dana.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
