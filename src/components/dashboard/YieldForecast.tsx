"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  name: string;
  date: string;
  expected: number;
  actual: number;
  milestone: string | null;
  height: number | null;
  condition: number | null;
}

interface YieldForecastProps {
  chartData: ChartDataPoint[];
  probability: number;
  targetYield: number;
  actualYield: number;
  cropName?: string;
}

const DUMMY_DATA = [
  { name: "Minggu 1", expected: 0, actual: 0, date: "Belum ada data" },
];

export function YieldForecast({ chartData, probability, targetYield, actualYield, cropName }: YieldForecastProps) {
  const hasData = chartData && chartData.length > 0 && targetYield > 0;
  
  const lastActual = chartData[chartData.length - 1]?.actual || 0;
  const deviationPercent = targetYield > 0
    ? (((lastActual - targetYield) / targetYield) * 100).toFixed(1)
    : null;

  const isBelow = deviationPercent !== null && parseFloat(deviationPercent) < 0;

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white">Yield Forecast Intelligence</CardTitle>
            <CardDescription className="text-slate-500">
              {cropName ? `Progres pertumbuhan: ${cropName}` : "Growth milestones vs Production targets"}
            </CardDescription>
          </div>
          {hasData && (
            <div className="flex items-center gap-4">
              <Badge className={isBelow ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}>
                {isBelow ? `↓ ${Math.abs(parseFloat(deviationPercent!))}% dari target` : `↑ On track`}
              </Badge>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase">Probabilitas Sukses</p>
                <p className={cn("text-2xl font-bold", probability >= 80 ? "text-emerald-500" : probability >= 50 ? "text-yellow-500" : "text-orange-500")}>
                  {probability}%
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData && (
          <div className="flex items-center justify-center h-[260px] text-slate-600 italic text-sm text-center">
            <div>
              <p>Belum ada data pertumbuhan.</p>
              <p className="text-xs mt-1">Minta Field Officer kirim laporan via Telegram Bot.</p>
              <p className="text-xs mt-1 font-mono bg-slate-950 px-2 py-1 rounded inline-block mt-2">TUMBUH [Tinggi] [Kondisi 1-5]</p>
            </div>
          </div>
        )}
        {hasData && (
          <>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}t`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "12px" }}
                  />
                  {targetYield > 0 && (
                    <ReferenceLine y={targetYield} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: `Target: ${targetYield}t`, fill: "#10b981", fontSize: 10 }} />
                  )}
                  <Area type="monotone" dataKey="targetYield" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" name="Target Ideal" />
                  <Area type="monotone" dataKey="predictedYield" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Progres Riil" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Target Ideal ({targetYield}t)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-400">Progres Riil ({lastActual.toFixed(1)}t est.)</span>
              </div>
              {actualYield > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-400">Panen Aktual ({actualYield}t)</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
