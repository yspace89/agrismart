import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { recordMaterialUsage } from "@/lib/actions";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Menu bantuan yang akan ditampilkan saat /START atau BANTUAN
const HELP_MESSAGE = `🌾 <b>AgriSmart Bot — Panduan Perintah</b>

<b>📊 Laporan Keuangan:</b>
• <code>BIAYA [Kategori] [Jumlah] [Keterangan]</code>
  Contoh: <code>BIAYA Pupuk 250000 Pupuk Urea Blok A</code>

<b>📦 Manajemen Gudang:</b>
• <code>PAKAI [Item] [Jumlah] [NamaBlok]</code>
  Contoh: <code>PAKAI Urea 2 BlokA</code>
• <code>STOK</code> — Cek semua sisa stok gudang

<b>🌱 Laporan Pertumbuhan:</b>
• <code>TUMBUH [TinggiCm] [Kondisi1-5] [Milestone]</code>
  Contoh: <code>TUMBUH 85 4 Generatif</code>
  (Kondisi: 1=Buruk, 3=Normal, 5=Excellent)

<b>📋 Info Lahan:</b>
• <code>LAHAN</code> — Daftar lahan aktif & status panen

Ketik <b>BANTUAN</b> untuk melihat panduan ini lagi.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { message } = body;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();
    const parts = text.split(" ");
    const command = parts[0].toUpperCase();

    // --- 1. START / BANTUAN COMMAND ---
    if (command === "/START" || command === "BANTUAN" || command === "HELP") {
      await sendTelegramMessage(chatId, HELP_MESSAGE);
      return NextResponse.json({ ok: true });
    }

    // --- 2. BIAYA COMMAND ---
    // Format: BIAYA [Kategori] [Jumlah] [Keterangan...]
    if (command === "BIAYA") {
      if (parts.length < 3) {
        await sendTelegramMessage(chatId, "❌ Format salah.\nGunakan: <code>BIAYA [Kategori] [Jumlah] [Keterangan]</code>\nContoh: <code>BIAYA Pupuk 250000 Pupuk Urea Blok A</code>");
        return NextResponse.json({ ok: true });
      }

      const category = parts[1];
      const amount = parseFloat(parts[2]);
      if (isNaN(amount) || amount <= 0) {
        await sendTelegramMessage(chatId, "❌ Jumlah tidak valid. Masukkan angka yang benar.");
        return NextResponse.json({ ok: true });
      }
      const description = parts.slice(3).join(" ");

      const { data: season } = await supabase
        .from("planting_seasons")
        .select("id, crop_name")
        .eq("status", "ongoing")
        .limit(1)
        .maybeSingle();

      const { error } = await supabase.from("expenses").insert({
        season_id: season?.id,
        category,
        amount,
        description,
        submitted_by: message.from?.first_name || "Field Officer",
        telegram_message_id: String(message.message_id),
      });

      if (error) {
        await sendTelegramMessage(chatId, "❌ Gagal simpan biaya: " + error.message);
      } else {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Biaya Dicatat!</b>\n\n` +
          `📌 Kategori: ${category}\n` +
          `💰 Jumlah: <b>Rp ${amount.toLocaleString("id-ID")}</b>\n` +
          `📝 Ket: ${description || "-"}\n` +
          `🌾 Project: ${season?.crop_name || "Umum"}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // --- 3. PAKAI COMMAND ---
    // Format: PAKAI [Item] [Jumlah] [NamaBlok]
    if (command === "PAKAI") {
      if (parts.length < 4) {
        await sendTelegramMessage(chatId, "❌ Format salah.\nGunakan: <code>PAKAI [Item] [Jumlah] [NamaBlok]</code>\nContoh: <code>PAKAI Urea 2 BlokA</code>");
        return NextResponse.json({ ok: true });
      }

      const itemName = parts[1];
      const quantity = parseFloat(parts[2]);
      const landName = parts[3];

      if (isNaN(quantity) || quantity <= 0) {
        await sendTelegramMessage(chatId, "❌ Jumlah tidak valid.");
        return NextResponse.json({ ok: true });
      }

      const { data: land } = await supabase
        .from("lands")
        .select("id, name")
        .ilike("name", `%${landName}%`)
        .maybeSingle();

      if (!land) {
        await sendTelegramMessage(chatId, `❌ Blok <b>"${landName}"</b> tidak ditemukan.\nKetik <code>LAHAN</code> untuk melihat daftar blok yang tersedia.`);
        return NextResponse.json({ ok: true });
      }

      try {
        await recordMaterialUsage({
          itemName,
          quantity,
          landId: land.id,
          description: `Input via Telegram oleh ${message.from?.first_name || "Field Officer"}`,
        });
        await sendTelegramMessage(
          chatId,
          `✅ <b>Pemakaian Dicatat!</b>\n\n` +
          `📦 Item: ${itemName}\n` +
          `🔢 Jumlah: ${quantity}\n` +
          `📍 Lokasi: ${land.name}`
        );
      } catch (e: any) {
        await sendTelegramMessage(chatId, `❌ Error: ${e.message}`);
      }
      return NextResponse.json({ ok: true });
    }

    // --- 4. STOK COMMAND ---
    if (command === "STOK") {
      const { data: items, error } = await supabase
        .from("inventory")
        .select("*")
        .order("item_name");

      if (error) {
        await sendTelegramMessage(chatId, "❌ Gagal ambil data stok: " + error.message);
      } else if (!items || items.length === 0) {
        await sendTelegramMessage(chatId, "📦 Gudang kosong. Belum ada inventaris yang terdaftar.");
      } else {
        const list = items
          .map((i) => {
            const isLow = Number(i.quantity) <= Number(i.par_level);
            const icon = Number(i.quantity) === 0 ? "🔴" : isLow ? "🟡" : "🟢";
            return `${icon} <b>${i.item_name}</b>: ${i.quantity} ${i.unit}${isLow ? " ⚠️ Segera restock!" : ""}`;
          })
          .join("\n");
        await sendTelegramMessage(chatId, `📦 <b>STATUS GUDANG:</b>\n\n${list}`);
      }
      return NextResponse.json({ ok: true });
    }

    // --- 5. TUMBUH COMMAND (BARU) ---
    // Format: TUMBUH [TinggiCm] [Kondisi1-5] [Milestone]
    // Contoh: TUMBUH 85 4 Generatif
    if (command === "TUMBUH") {
      if (parts.length < 3) {
        await sendTelegramMessage(
          chatId,
          "❌ Format salah.\nGunakan: <code>TUMBUH [TinggiCm] [Kondisi1-5] [Milestone]</code>\nContoh: <code>TUMBUH 85 4 Generatif</code>\n\nKondisi: 1=Buruk, 2=Kurang, 3=Normal, 4=Baik, 5=Sangat Baik\nMilestone: Vegetatif / Generatif / Pra-Panen"
        );
        return NextResponse.json({ ok: true });
      }

      const heightCm = parseFloat(parts[1]);
      const conditionScore = parseInt(parts[2]);
      const milestone = parts.slice(3).join(" ") || "Tidak Diset";

      if (isNaN(heightCm) || isNaN(conditionScore) || conditionScore < 1 || conditionScore > 5) {
        await sendTelegramMessage(chatId, "❌ Data tidak valid. Tinggi harus angka, kondisi antara 1-5.");
        return NextResponse.json({ ok: true });
      }

      const { data: season } = await supabase
        .from("planting_seasons")
        .select("id, crop_name")
        .eq("status", "ongoing")
        .limit(1)
        .maybeSingle();

      if (!season) {
        await sendTelegramMessage(chatId, "❌ Tidak ada musim tanam aktif yang ditemukan.");
        return NextResponse.json({ ok: true });
      }

      const { error } = await supabase.from("growth_logs").insert({
        season_id: season.id,
        height_cm: heightCm,
        condition_score: conditionScore,
        milestone,
        notes: `Dilaporkan via Telegram oleh ${message.from?.first_name || "Field Officer"}`,
        date: new Date().toISOString().split("T")[0],
      });

      const conditionLabels: Record<number, string> = { 1: "Buruk 🔴", 2: "Kurang 🟠", 3: "Normal 🟡", 4: "Baik 🟢", 5: "Sangat Baik ✅" };

      if (error) {
        await sendTelegramMessage(chatId, "❌ Gagal simpan laporan: " + error.message);
      } else {
        await sendTelegramMessage(
          chatId,
          `🌱 <b>Laporan Pertumbuhan Dicatat!</b>\n\n` +
          `📏 Tinggi: <b>${heightCm} cm</b>\n` +
          `💪 Kondisi: <b>${conditionLabels[conditionScore] || conditionScore}</b>\n` +
          `🔖 Fase: <b>${milestone}</b>\n` +
          `🌾 Project: ${season.crop_name}\n\n` +
          `<i>Data ini akan memperbarui Yield Forecast di dashboard.</i>`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // --- 6. LAHAN COMMAND (BARU) ---
    if (command === "LAHAN") {
      const { data: lands } = await supabase
        .from("lands")
        .select("*, planting_seasons(crop_name, status, budget_total)")
        .eq("status", "active");

      if (!lands || lands.length === 0) {
        await sendTelegramMessage(chatId, "📍 Belum ada lahan yang terdaftar.");
      } else {
        const list = lands
          .map((l) => {
            const season = (l.planting_seasons as any[])?.[0];
            return (
              `📍 <b>${l.name}</b>\n` +
              `   Komoditas: ${season?.crop_name || "-"}\n` +
              `   Status: ${season?.status || l.status}`
            );
          })
          .join("\n\n");
        await sendTelegramMessage(chatId, `🗺️ <b>DAFTAR LAHAN AKTIF:</b>\n\n${list}`);
      }
      return NextResponse.json({ ok: true });
    }

    // Fallback: perintah tidak dikenal
    await sendTelegramMessage(
      chatId,
      `❓ Perintah <b>"${command}"</b> tidak dikenal.\n\nKetik <b>BANTUAN</b> untuk melihat daftar perintah yang tersedia.`
    );
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
        parse_mode: "HTML",
      }),
    });
    const result = await res.json();
    if (!result.ok) console.error("Telegram API Error:", result);
  } catch (e) {
    console.error("Failed to send telegram message:", e);
  }
}
