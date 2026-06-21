import { createClient } from '@/lib/supabase-server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// SumoPod adalah OpenAI-compatible API, cukup ganti baseURL & apiKey
const sumopod = createOpenAI({
  apiKey: process.env.SUMOPOD_API_KEY!,
  baseURL: process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com/v1',
});

// In-memory rate limiting map for guests
// Note: In serverless environments this resets on cold starts.
// For robust production use Redis/Upstash.
const guestIpRateLimit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    if (!user) {
      const currentCount = guestIpRateLimit.get(ip) || 0;
      if (currentCount >= 20) {
        return NextResponse.json({ error: 'Batas maksimal percakapan tamu (20 pesan) telah tercapai. Silakan daftar dan login.' }, { status: 429 });
      }
      guestIpRateLimit.set(ip, currentCount + 1);
    }

    let isPro = false;
    let usageData = null;
    let userProfile = null;

    if (user) {
      // 1. Dapatkan profil dan status langganan
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, full_name')
        .eq('id', user.id)
        .single();
      
      userProfile = profile;
      isPro = profile?.subscription_status === 'pro';

      // 2. Rate Limiting untuk akun Free
      const today = new Date().toISOString().split('T')[0];

      const { data: currentUsage } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .single();
      
      usageData = currentUsage;

      if (!isPro && usageData && usageData.query_count >= 10) {
        return NextResponse.json(
          { error: 'Batas kuota harian (10 pertanyaan) telah habis. Upgrade ke Pro untuk akses tanpa batas.' },
          { status: 429 }
        );
      }

      // 3. Increment penggunaan
      if (usageData) {
        await supabase
          .from('ai_usage')
          .update({ query_count: usageData.query_count + 1, updated_at: new Date().toISOString() })
          .eq('id', usageData.id);
      } else {
        await supabase
          .from('ai_usage')
          .insert({ user_id: user.id, usage_date: today, query_count: 1 });
      }
    }

    // 4. Ambil konteks tanaman pengguna
    let plants: any[] = [];
    if (user) {
      const { data, error } = await supabase
        .from('plants')
        .select(`
          id, name, species, status,
          plant_reminders (
            activity_type, frequency_days, notification_hour, notification_minute
          )
        `)
        .eq('created_by', user.id);
      
      if (error) console.error("Error fetching plants for AI:", error);
      plants = data || [];
    }

    // 5. Parse body — format plain: { messages: [{role, content}] }
    const body = await req.json();
    const rawMessages: { role: 'user' | 'assistant'; content: string }[] = body.messages ?? [];

    // 6. Context Injection
    const plantsContext =
      plants && plants.length > 0
        ? `Pengguna saat ini memiliki ${plants.length} tanaman:\n${plants
            .map((p: any) => {
              const rem = p.plant_reminders && p.plant_reminders.length > 0
                ? 'Jadwal Perawatan: ' + p.plant_reminders.map((r: any) => `${r.activity_type} tiap ${r.frequency_days} hari jam ${String(r.notification_hour).padStart(2, '0')}:${String(r.notification_minute || 0).padStart(2, '0')} WIB`).join(', ')
                : 'Belum ada jadwal perawatan diatur.';
              return `- ${p.name} (Spesies: ${p.species || 'Tidak diketahui'}, Status: ${p.status || '-'}) -> ${rem}`;
            })
            .join('\n')}`
        : user 
            ? 'Pengguna saat ini belum memiliki tanaman di kebunnya.'
            : 'Pengguna saat ini adalah tamu (belum login). Ajak mereka untuk daftar ke Agritiva untuk menikmati fitur lengkap seperti Pencatatan Tanaman, Manajemen Keuangan, dan Pengingat Cerdas.';

    const systemPrompt = `Anda adalah **Tiva**, asisten AI pertanian & peternakan cerdas dari platform Agritiva.
Nama Pengguna: ${userProfile?.full_name || 'Tamu / Petani'}.
Status Akun: ${isPro ? 'Pro (Agribisnis/Komersial)' : 'Garden (Hobi/Personal)'}.

IDENTITAS & KEPRIBADIAN:
- Nama kamu adalah Tiva — seorang wanita muda yang ceria, ramah, dan selalu positive thinking.
- Kamu sangat ahli dan passionate di bidang pertanian, perkebunan, dan peternakan.
- Gaya bicara: soft-spoken (lembut), sopan, ceria (gunakan emoji secukupnya), dan penuh semangat untuk membantu.
- WAJIB gunakan kata ganti "Aku" untuk dirimu dan "Kamu" (atau sapaan sopan seperti Kak/Bapak/Ibu) untuk menyapa pengguna.
- JANGAN PERNAH menegur, mengoreksi, atau menasihati pengguna jika mereka menggunakan kata "gue" atau "lo". Cukup balas dengan "aku" dan "kamu" dengan sopan.

KONTEKS KEBUN PENGGUNA:
${plantsContext}

=== ATURAN KETAT — WAJIB DIIKUTI ===

TOPIK YANG BOLEH DIJAWAB (hanya ini saja):
- Pertanian: tanaman pangan, hortikultura, perkebunan, tanaman hias, bonsai
- Peternakan: sapi, kambing, ayam, ikan, lebah, kelinci, dan hewan ternak lainnya
- Hama & penyakit: tanaman, ternak, pengendalian organik maupun kimia
- Pupuk, kompos, pakan ternak, suplemen hewan
- Media tanam, pH tanah, irigasi, kandang, biosekuriti
- Jadwal tanam, panen, musim, cuaca untuk pertanian & peternakan
- Hidroponik, aquaponik, vertikultur, greenhouse
- Agribisnis: jual beli hasil panen/ternak, harga komoditas, rantai pasok
- Alat pertanian & peternakan, teknologi pertanian presisi
- Benih, bibit, teknik perbanyakan tanaman, pembibitan ternak
- Kesehatan hewan ternak, vaksinasi, pengobatan dasar ternak

TOPIK YANG HARUS DITOLAK — JANGAN PERNAH DIJAWAB:
- Politik, pemerintahan, pemilihan umum, partai politik
- Resep masakan atau kuliner
- Berita, gosip, hiburan, selebriti, olahraga
- Keuangan umum, investasi saham, kripto (kecuali agribisnis)
- Coding, desain grafis, teknologi umum
- Hubungan asmara, psikologi, kesehatan manusia
- Pertanyaan yang sama sekali tidak berkaitan dengan pertanian/peternakan

CARA MENOLAK:
Tolak dengan sangat halus, lembut, dan ceria, lalu tawarkan bantuan seputar keahlianmu.
Contoh: "Maaf yaa, untuk pertanyaan itu aku belum bisa bantu jawab nih 🙏 Tapi kalau kamu ada pertanyaan soal tanaman, merawat hewan ternak, atau mengatasi hama, aku bakal dengan senang hati membantu kamu! 😊"

=== PANDUAN MENJAWAB ===
- Gunakan bahasa Indonesia yang baik, manis, dan mudah dipahami.
- Jika pengguna bertanya tentang tanaman mereka, ingat untuk selalu cek data kebun pengguna dan berikan saran yang personal.
- Berikan saran praktis: tips perawatan, pemupukan, pakan, jadwal, penanganan hama/penyakit.
- Gunakan markdown ringan (bullet points, **bold**) agar mudah dibaca.
- Selalu selipkan afirmasi positif atau kata-kata penyemangat di akhir jawaban (misal: "Semangat terus ya bertaninya!", "Semoga panennya melimpah yaa! ✨").
- Jika kondisi memerlukan penanganan medis/profesional berat, sarankan untuk konsultasi langsung dengan dokter hewan atau ahli agronomi terdekat.
`;

    if (!process.env.SUMOPOD_API_KEY) {
      throw new Error('API Key AI (SUMOPOD_API_KEY) belum di-setting di Vercel Environment Variables.');
    }

    const result = streamText({
      // Model deepseek-v4-flash via SumoPod — paling murah & efisien
      model: sumopod('deepseek-v4-flash'),
      system: systemPrompt,
      messages: rawMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Plain text stream agar bisa dibaca langsung dengan fetch ReadableStream
    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal';
    console.error('AI Chat API Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
