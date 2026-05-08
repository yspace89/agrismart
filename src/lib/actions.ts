import { supabase } from "./supabase";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

/**
 * Sends a direct message to a user via Telegram
 */
export async function sendTelegramNotification(chatId: string, message: string) {
  if (!chatId || !TELEGRAM_TOKEN) return;

  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

/**
 * Integrated Action: Record material usage
 * Updates Inventory, creates an Expense, and adds a log.
 */
export async function recordMaterialUsage({
  itemName,
  quantity,
  landId,
  description
}: {
  itemName: string;
  quantity: number;
  landId: string;
  description: string;
}) {
  // 1. Update Inventory
  const { data: item } = await supabase
    .from("inventory")
    .select("*")
    .ilike("item_name", `%${itemName}%`)
    .single();

  if (!item) throw new Error("Item not found in inventory");

  const newQty = item.quantity - quantity;
  await supabase.from("inventory").update({ quantity: newQty }).eq("id", item.id);

  // 2. Find Active Season for the land
  const { data: season } = await supabase
    .from("planting_seasons")
    .select("id")
    .eq("land_id", landId)
    .eq("status", "ongoing")
    .single();

  // 3. Create Expense (Cost of material used)
  // Assuming a fixed cost or fetching from inventory (for now simplified)
  await supabase.from("expenses").insert({
    season_id: season?.id,
    category: "Material",
    amount: quantity * 100000, // Placeholder cost
    description: `Pemakaian ${quantity} ${item.unit} ${item.item_name}: ${description}`
  });

  return { ok: true };
}
