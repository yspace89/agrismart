import { supabase } from "@/lib/supabase";

export async function getDashboardStats() {
  // Get Total Expenses
  const { data: expenses } = await supabase.from("expenses").select("amount");
  const totalSpent = expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  // Get Active Seasons
  const { count: activeSeasons } = await supabase
    .from("planting_seasons")
    .select("*", { count: 'exact', head: true })
    .eq("status", "ongoing");

  // Get Recent Logs (from expenses for now)
  const { data: recentExpenses } = await supabase
    .from("expenses")
    .select("*, planting_seasons(crop_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalSpent,
    activeSeasons: activeSeasons || 0,
    recentLogs: recentExpenses?.map(e => ({
      id: e.id,
      petak: (e.planting_seasons as any)?.crop_name || "Unknown",
      activity: `Input Biaya: ${e.category}`,
      user: "Telegram User",
      status: "Selesai",
      date: new Date(e.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
    })) || []
  };
}
