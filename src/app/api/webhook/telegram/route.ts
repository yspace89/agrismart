import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { recordMaterialUsage } from "@/lib/actions";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Telegram Webhook Received:", body);
    
    const { message } = body;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();
    const command = text.split(" ")[0].toUpperCase();

    // --- 1. START COMMAND ---
    if (command === "/START") {
      await sendTelegramMessage(chatId, "Selamat datang di AgriSmart Bot! 🌿\n\nFormat Laporan:\n1. BIAYA [Kategori] [Jumlah] [Ket]\n2. PAKAI [Item] [Jumlah] [Blok]\n3. STOK (Cek sisa barang)");
      return NextResponse.json({ ok: true });
    }

    // --- 2. BIAYA COMMAND ---
    if (command === "BIAYA") {
      const parts = text.split(" ");
      if (parts.length < 3) {
        await sendTelegramMessage(chatId, "❌ Format salah. Gunakan: BIAYA [Kategori] [Jumlah] [Ket]");
        return NextResponse.json({ ok: true });
      }
      
      const category = parts[1];
      const amount = parseFloat(parts[2]);
      const description = parts.slice(3).join(" ");

      const { data: season } = await supabase.from("planting_seasons").select("id").eq("status", "ongoing").limit(1).maybeSingle();

      const { error } = await supabase.from("expenses").insert({
        season_id: season?.id,
        category,
        amount,
        description
      });

      if (error) {
        await sendTelegramMessage(chatId, "❌ Gagal simpan biaya: " + error.message);
      } else {
        await sendTelegramMessage(chatId, `✅ Biaya Dicatat: Rp ${amount.toLocaleString('id-ID')}`);
      }
      return NextResponse.json({ ok: true });
    }

    // --- 3. PAKAI COMMAND ---
    if (command === "PAKAI") {
      const parts = text.split(" "); 
      if (parts.length < 4) {
        await sendTelegramMessage(chatId, "❌ Format salah. Gunakan: PAKAI [Item] [Jumlah] [NamaBlok]");
        return NextResponse.json({ ok: true });
      }

      const itemName = parts[1];
      const quantity = parseFloat(parts[2]);
      const landName = parts[3];

      const { data: land } = await supabase.from("lands").select("id").ilike("name", `%${landName}%`).maybeSingle();
      
      if (!land) {
        await sendTelegramMessage(chatId, `❌ Blok "${landName}" tidak ditemukan di database.`);
        return NextResponse.json({ ok: true });
      }

      try {
        await recordMaterialUsage({
          itemName,
          quantity,
          landId: land.id,
          description: "Input via Telegram Bot"
        });
        await sendTelegramMessage(chatId, `✅ Berhasil! Stok ${itemName} berkurang ${quantity}.`);
      } catch (e: any) {
        await sendTelegramMessage(chatId, `❌ Error: ${e.message}`);
      }
      return NextResponse.json({ ok: true });
    }

    // --- 4. STOK COMMAND ---
    if (command === "STOK") {
      const { data: items, error } = await supabase.from("inventory").select("*");
      if (error) {
        await sendTelegramMessage(chatId, "❌ Gagal ambil data stok: " + error.message);
      } else {
        const list = items?.map(i => `• ${i.item_name}: ${i.quantity} ${i.unit}`).join("\n");
        await sendTelegramMessage(chatId, `📦 <b>STATUS GUDANG:</b>\n\n${list || 'Kosong'}`);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text,
        parse_mode: "HTML"
      }),
    });
    const result = await res.json();
    if (!result.ok) console.error("Telegram API Error:", result);
  } catch (e) {
    console.error("Failed to send telegram message:", e);
  }
}
