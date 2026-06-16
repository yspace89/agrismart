"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, CheckCircle } from "lucide-react";

interface FinancialIntelligenceProps {
  budget?: number;
  spent?: number;
  dailyBurnRate?: number;
  estimatedDaysRemaining?: number | null;
  harvestDate?: string | null;
  cropName?: string;
}

function getDaysUntilHarvest(harvestDate: string | null): number | null {
  if (!harvestDate) return null;
  const today = new Date();
  const harvest = new Date(harvestDate);
  const diff = Math.ceil((harvest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function FinancialIntelligence({
  budget = 0,
  spent = 0,
  dailyBurnRate = 0,
  estimatedDaysRemaining = null,
  harvestDate = null,
  cropName,
}: FinancialIntelligenceProps) {
  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  const daysUntilHarvest = getDaysUntilHarvest(harvestDate);
  
  // Cashflow risk: dana habis sebelum panen
  const isAtRisk =
    estimatedDaysRemaining !== null &&
    daysUntilHarvest !== null &&
    estimatedDaysRemaining < daysUntilHarvest;

  const noData = budget === 0 && spent === 0;

  if (noData) {
    return (
      <Card className="bg-slate-900 border-slate-800 shadow-xl col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Financial Intelligence</CardTitle>
          <CardDescription className="text-slate-500">Burn-rate vs Harvest Timeline</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-slate-600 italic text-sm text-center">
            Belum ada project aktif.<br />Buat lahan & set budget terlebih dahulu.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white">Financial Intelligence</CardTitle>
            <CardDescription className="text-slate-500">
              {cropName ? `Project: ${cropName}` : "Burn-rate vs Harvest Timeline"}
            </CardDescription>
          </div>
          {isAtRisk ? (
            <Badge variant="destructive" className="animate-pulse bg-red-500/20 text-red-500 border-red-500/50">
              <AlertCircle className="w-3 h-3 mr-1" /> Risiko Cashflow
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50">
              <CheckCircle className="w-3 h-3 mr-1" /> Aman
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Budget Terpakai</span>
            <span className="text-white font-medium">{percent.toFixed(1)}%</span>
          </div>
          <Progress
            value={percent}
            className={`h-2 bg-slate-800 ${percent > 80 ? "[&>div]:bg-red-500" : percent > 60 ? "[&>div]:bg-orange-500" : "[&>div]:bg-emerald-500"}`}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Rp {spent.toLocaleString("id-ID")}</span>
            <span>Total Rp {budget.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase">Sisa Umur Dana</p>
            <p className={`text-2xl font-bold ${estimatedDaysRemaining !== null && estimatedDaysRemaining < 15 ? "text-red-500" : "text-orange-500"}`}>
              {estimatedDaysRemaining !== null ? `${estimatedDaysRemaining} Hari` : "—"}
            </p>
            <p className="text-[10px] text-slate-600">
              Burn: Rp {dailyBurnRate.toLocaleString("id-ID")}/hari
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase">Estimasi Panen</p>
            <p className="text-2xl font-bold text-emerald-500">
              {daysUntilHarvest !== null ? `${daysUntilHarvest} Hari` : "—"}
            </p>
            <p className="text-[10px] text-slate-600">
              {harvestDate ? new Date(harvestDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Belum diset"}
            </p>
          </div>
        </div>

        {/* Alert */}
        {isAtRisk && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3 items-start">
            <TrendingDown className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-200">
              Dana operasional diprediksi habis{" "}
              <span className="font-bold text-white">
                {daysUntilHarvest! - estimatedDaysRemaining!} hari sebelum panen
              </span>
              . Disarankan efisiensi atau penambahan dana segera.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
