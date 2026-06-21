import { createClient } from "@/lib/supabase-server";export async function getDashboardStats() {
  const supabase = await createClient();
  // 1. Total Expenses (semua waktu)
  const { data: expenses } = await supabase.from("expenses").select("amount");
  const totalSpent = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // 2. Active Seasons count
  const { count: activeSeasons } = await supabase
    .from("planting_seasons")
    .select("*", { count: "exact", head: true })
    .eq("status", "ongoing");

  // 3. Season Financials dari view (termasuk burn rate harian yang sudah dikalkulasi)
  const { data: seasonFinancials } = await supabase
    .from("v_season_financials")
    .select("*")
    .eq("status", "ongoing")
    .order("start_date", { ascending: false })
    .limit(1);

  const primarySeason = seasonFinancials?.[0] || null;

  // 4. Inventory stats (item kritis)
  const { data: inventoryItems } = await supabase
    .from("inventory")
    .select("quantity, par_level, item_name");
  
  const criticalItems = inventoryItems?.filter(i => Number(i.quantity) <= Number(i.par_level)) || [];
  const totalItems = inventoryItems?.length || 0;

  // 5. Recent Activity Logs (dari growth_logs, bukan expenses)
  const { data: recentGrowth } = await supabase
    .from("growth_logs")
    .select("*, planting_seasons(crop_name, lands(name))")
    .order("created_at", { ascending: false })
    .limit(5);

  // 6. Recent Expenses (sebagai fallback jika growth_logs kosong)
  const { data: recentExpenses } = await supabase
    .from("expenses")
    .select("*, planting_seasons(crop_name, lands(name))")
    .order("created_at", { ascending: false })
    .limit(5);

  // Merge activity logs: prioritaskan growth_logs, fallback ke expenses
  const recentLogs = recentGrowth && recentGrowth.length > 0
    ? recentGrowth.map((log) => ({
        id: log.id,
        petak: (log.planting_seasons as any)?.lands?.name || (log.planting_seasons as any)?.crop_name || "Unknown",
        activity: `Laporan Pertumbuhan: ${log.milestone || "Update"} (Kondisi: ${log.condition_score}/5)`,
        user: "Field Officer",
        status: "Selesai",
        date: new Date(log.created_at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
      }))
    : (recentExpenses?.map((e) => ({
        id: e.id,
        petak: (e.planting_seasons as any)?.lands?.name || (e.planting_seasons as any)?.crop_name || "Unknown",
        activity: `Input Biaya: ${e.category} — ${e.description || ''}`,
        user: e.submitted_by || "Telegram User",
        status: "Selesai",
        date: new Date(e.created_at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
      })) || []);

  return {
    totalSpent,
    activeSeasons: activeSeasons || 0,
    // Financial intelligence (dari season aktif pertama)
    primarySeason: primarySeason
      ? {
          cropName: primarySeason.crop_name,
          budget: Number(primarySeason.budget_total),
          spent: Number(primarySeason.total_spent),
          remaining: Number(primarySeason.remaining_budget),
          burnRatePercent: Number(primarySeason.burn_rate_percent || 0),
          dailyBurnRate: Number(primarySeason.daily_burn_rate || 0),
          estimatedDaysRemaining: primarySeason.estimated_days_remaining
            ? Math.round(Number(primarySeason.estimated_days_remaining))
            : null,
          startDate: primarySeason.start_date,
          harvestDate: primarySeason.estimated_harvest_date,
          targetYield: Number(primarySeason.target_yield_tons || 0),
          actualYield: Number(primarySeason.actual_yield_tons || 0),
          landName: primarySeason.land_name || "",
        }
      : null,
    // Inventory summary
    inventory: {
      totalItems,
      criticalCount: criticalItems.length,
      criticalItems: criticalItems.map(i => i.item_name),
    },
    recentLogs,
  };
}

export async function getYieldForecastData(seasonId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("growth_logs")
    .select("*, planting_seasons(land_id, crop_name, start_date, estimated_harvest_date, target_yield_tons)")
    .order("date", { ascending: true });

  let activeSeasonId = seasonId;

  if (!seasonId) {
    // Ambil season aktif terbaru
    const { data: activeSeason } = await supabase
      .from("planting_seasons")
      .select("id")
      .eq("status", "ongoing")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (activeSeason) {
      activeSeasonId = activeSeason.id;
      query = query.eq("season_id", activeSeason.id);
    }
  } else {
    query = query.eq("season_id", seasonId);
  }

  const { data: logs } = await query;
  
  // Algoritma Yield Forecasting
  let probability = 0;
  let chartData = [];

  if (logs && logs.length > 0) {
    const landId = (logs[0].planting_seasons as any)?.land_id;
    
    // Ambil data sensor rata-rata untuk lahan ini jika ada
    let sensorModifier = 1.0; // Default modifier (no impact if no sensor data)
    let avgMoisture = 0;

    if (landId) {
      const { data: sensorLogs } = await supabase
        .from("sensor_logs")
        .select("value")
        .eq("land_id", landId)
        .order("timestamp", { ascending: false })
        .limit(10);
        
      if (sensorLogs && sensorLogs.length > 0) {
        avgMoisture = sensorLogs.reduce((acc, curr) => acc + curr.value, 0) / sensorLogs.length;
        // Jika moisture terlalu rendah (< 30) atau terlalu tinggi (> 80), probabilitas turun
        if (avgMoisture < 30) sensorModifier = 0.8;
        else if (avgMoisture > 80) sensorModifier = 0.9;
        else sensorModifier = 1.1; // Optimal moisture boosts probability
      }
    }

    // Hitung rata-rata condition score (1-5) dari logs
    const avgScore = logs.reduce((acc, log) => acc + log.condition_score, 0) / logs.length;
    
    // Base probability dari skor kondisi tanaman (Score 5 = 90% probabilitas awal)
    const baseProbability = (avgScore / 5) * 90; 
    
    // Terapkan sensor modifier
    probability = Math.min(Math.round(baseProbability * sensorModifier), 99); // Max 99%

    // Siapkan data untuk chart
    const firstDate = new Date(logs[0].date);
    chartData = logs.map(log => {
      const target = (log.planting_seasons as any)?.target_yield_tons || 10;
      // Prediksi yield pada titik waktu ini
      const predictedYield = (log.condition_score / 5) * target * sensorModifier;
      
      const weekNum = Math.ceil((new Date(log.date).getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

      return {
        ...log,
        name: `Minggu ${weekNum}`,
        predictedYield: Math.round(predictedYield * 10) / 10, // 1 desimal
        targetYield: target
      };
    });
  }

  return {
    probability,
    chartData
  };
}
