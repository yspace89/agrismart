import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Gunakan service role key agar bisa baca data semua user (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Vercel Cron jobs dapat berjalan hingga 300 detik
export const maxDuration = 60;

/**
 * Hitung next_send_at berikutnya setelah notif terkirim.
 * Menghormati notification_hour & notification_minute dalam WIB (UTC+7).
 */
function calcNextSendAt(frequencyDays: number, notificationHour: number, notificationMinute: number): string {
  const now = new Date();
  const currentWibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const targetWibTime = new Date(currentWibTime);
  targetWibTime.setUTCHours(notificationHour, notificationMinute, 0, 0);
  
  if (targetWibTime <= currentWibTime) {
    targetWibTime.setUTCDate(targetWibTime.getUTCDate() + Math.max(1, frequencyDays));
  }
  
  return new Date(targetWibTime.getTime() - 7 * 60 * 60 * 1000).toISOString();
}

/**
 * GET /api/cron/send-reminders
 * Dipanggil oleh Vercel Cron setiap jam, atau manual via ?secret=CRON_SECRET
 */
export async function GET(req: Request) {
  const startTime = Date.now();

  try {
    // ── Autentikasi ──────────────────────────────────────────────────────────
    const cronSecret = process.env.CRON_SECRET;
    const { searchParams } = new URL(req.url);
    const secretParam = searchParams.get('secret');
    const authHeader = req.headers.get('authorization');

    const isVercelCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isManualTest = cronSecret && secretParam === cronSecret;

    if (cronSecret && !isVercelCron && !isManualTest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Setup VAPID ───────────────────────────────────────────────────────────
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPublic || !vapidPrivate) {
      console.error('[Cron] VAPID keys tidak dikonfigurasi');
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }
    webpush.setVapidDetails('mailto:admin@agritiva.app', vapidPublic, vapidPrivate);

    // ── Ambil reminder yang jatuh tempo ───────────────────────────────────────
    const now = new Date().toISOString();
    const { data: reminders, error: remindersError } = await supabaseAdmin
      .from('plant_reminders')
      .select('*, plants(name)')
      .eq('is_active', true)
      .lte('next_send_at', now);

    if (remindersError) {
      console.error('[Cron] DB error fetching reminders:', remindersError.message);
      return NextResponse.json({ error: remindersError.message }, { status: 500 });
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({
        message: 'Tidak ada reminder yang perlu dikirim.',
        checked_at: now,
        duration_ms: Date.now() - startTime,
      });
    }

    // ── Proses setiap reminder ────────────────────────────────────────────────
    let sentCount = 0;
    let failedCount = 0;
    const results: object[] = [];

    for (const reminder of reminders) {
      const userId = reminder.created_by;
      const plantName = reminder.plants?.name || 'Tanaman Anda';
      const activityType = reminder.activity_type;
      const frequencyDays: number = reminder.frequency_days;
      const notifHour: number = reminder.notification_hour;
      const notifMinute: number = reminder.notification_minute ?? 0;

      // Ambil semua push subscriptions milik user
      const { data: subs, error: subErr } = await supabaseAdmin
        .from('push_subscriptions')
        .select('id, subscription')
        .eq('user_id', userId);

      if (subErr) {
        console.error(`[Cron] Gagal ambil subscriptions untuk user ${userId}:`, subErr.message);
        results.push({ reminder_id: reminder.id, status: 'db_error', detail: subErr.message });
        continue;
      }

      if ((!subs || subs.length === 0) && true /* we will check telegram below */) {
        // Will check telegram later
      }
      
      const payload = JSON.stringify({
          title: `🌿 Waktunya ${activityType}!`,
          body: `Jangan lupa ${activityType.toLowerCase()} ${plantName} hari ini ya!`,
          url: `/plants/${reminder.plant_id}`,
          icon: '/logo.png',
        });

        for (const sub of subs) {
          // sub.subscription adalah PushSubscription JSON object
          try {
            await webpush.sendNotification(sub.subscription, payload);
            sentCount++;
          } catch (err: any) {
            console.error('[Cron] Push error:', err.statusCode, err.message);
            failedCount++;
            // Hapus subscription yang sudah expired / tidak valid
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
              console.log(`[Cron] Hapus expired subscription ${sub.id}`);
            }
          }
        }

        // --- NEW: TELEGRAM NOTIFICATION ---
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('telegram_chat_id, full_name')
          .eq('id', userId)
          .maybeSingle();

        let telegramStatus = 'not_connected';
        if (profile?.telegram_chat_id) {
          try {
            const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
            const text = `🌿 <b>Waktunya ${activityType}!</b>\n\nHalo ${profile.full_name || 'Petani'}, jangan lupa ${activityType.toLowerCase()} tanaman <b>${plantName}</b> Anda hari ini ya!`;
            
            const res = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: profile.telegram_chat_id,
                text,
                parse_mode: "HTML",
              }),
            });
            const result = await res.json();
            if (result.ok) {
              telegramStatus = 'sent';
              sentCount++;
            } else {
              telegramStatus = 'error: ' + result.description;
              failedCount++;
            }
          } catch (e: any) {
            telegramStatus = 'error: ' + e.message;
            failedCount++;
          }
        }

        results.push({
          reminder_id: reminder.id,
          plant: plantName,
          activity: activityType,
          subscriptions: subs.length,
          telegram_status: telegramStatus,
          status: 'processed',
        });

      // Update last_sent_at dan hitung next_send_at berikutnya
      const nextSendAt = calcNextSendAt(frequencyDays, notifHour, notifMinute);
      await supabaseAdmin
        .from('plant_reminders')
        .update({ last_sent_at: now, next_send_at: nextSendAt })
        .eq('id', reminder.id);
    }

    return NextResponse.json({
      success: true,
      total_reminders: reminders.length,
      notifications_sent: sentCount,
      notifications_failed: failedCount,
      results,
      executed_at: now,
      duration_ms: Date.now() - startTime,
    });
  } catch (err: any) {
    console.error('[Cron] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
