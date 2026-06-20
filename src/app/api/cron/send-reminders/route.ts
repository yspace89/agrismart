import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Gunakan service role key agar bisa baca data semua user (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 30;

export async function GET(req: Request) {
  try {
    // Amankan endpoint agar hanya bisa dipanggil oleh Vercel Cron atau admin
    const cronSecret = process.env.CRON_SECRET;
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const authHeader = req.headers.get('authorization');

    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualTest = secret && secret === cronSecret;

    if (cronSecret && !isVercelCron && !isManualTest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Setup VAPID
    webpush.setVapidDetails(
      'mailto:admin@agritiva.app',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );

    // Ambil semua reminder yang sudah jatuh tempo
    const now = new Date().toISOString();
    const { data: reminders, error: remindersError } = await supabaseAdmin
      .from('plant_reminders')
      .select('*, plants(name, created_by)')
      .eq('is_active', true)
      .lte('next_send_at', now);

    if (remindersError) {
      console.error('[Cron] DB error fetching reminders:', remindersError.message);
      return NextResponse.json({ error: remindersError.message }, { status: 500 });
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ message: 'Tidak ada reminder yang perlu dikirim.', checked_at: now });
    }

    let sentCount = 0;
    const results = [];

    for (const reminder of reminders) {
      const userId = reminder.created_by;
      const plantName = reminder.plants?.name || 'Tanaman Anda';
      const activityType = reminder.activity_type;

      // Ambil push subscriptions user
      const { data: subs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subs || subs.length === 0) {
        results.push({ reminder_id: reminder.id, status: 'no_subscription' });
        // Tetap update next_send_at walaupun tidak ada subscription
      } else {
        const payload = JSON.stringify({
          title: `🌱 Waktunya Merawat!`,
          body: `${activityType} untuk ${plantName} sudah dijadwalkan hari ini.`,
          url: `/plants/${reminder.plant_id}`,
        });

        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            );
            sentCount++;
          } catch (err: any) {
            console.error('[Cron] Push error:', err.statusCode, sub.endpoint);
            // Hapus subscription expired
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
            }
          }
        }
        results.push({ reminder_id: reminder.id, plant: plantName, activity: activityType, status: 'sent' });
      }

      // Hitung next_send_at berikutnya
      const nextSend = new Date();
      nextSend.setDate(nextSend.getDate() + reminder.frequency_days);
      // Set ke jam notifikasi di hari itu (UTC, notification_hour adalah WIB)
      const hourUtc = (reminder.notification_hour - 7 + 24) % 24;
      nextSend.setHours(hourUtc, 0, 0, 0);

      await supabaseAdmin
        .from('plant_reminders')
        .update({
          last_sent_at: now,
          next_send_at: nextSend.toISOString(),
        })
        .eq('id', reminder.id);
    }

    return NextResponse.json({
      success: true,
      total_reminders: reminders.length,
      notifications_sent: sentCount,
      results,
      executed_at: now,
    });
  } catch (err: any) {
    console.error('[Cron] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
