"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { name: "Minggu 1", expected: 2, actual: 2.1 },
  { name: "Minggu 2", expected: 3.5, actual: 3.2 },
  { name: "Minggu 3", expected: 5, actual: 4.8 },
  { name: "Minggu 4", expected: 7, actual: 6.5 },
  { name: "Minggu 5", expected: 9, actual: 8.2 },
  { name: "Minggu 6", expected: 12, actual: 10.5 },
];

export function YieldForecast() {
  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Yield Forecast Intelligence</CardTitle>
        <CardDescription className="text-slate-500">Growth milestones vs Production targets (Tons)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#475569" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#475569" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}t`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="expected" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExpected)" 
                name="Target Ideal"
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorActual)" 
                name="Progres Riil"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Target Ideal (14.2t)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-400">Progres Riil (10.5t)</span>
          </div>
          <div className="ml-auto text-orange-400 font-medium">
            ↓ 12.5% dari target
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
