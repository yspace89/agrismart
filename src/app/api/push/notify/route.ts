import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

// [VULN-03 FIX] Secret untuk mengamankan endpoint internal ini
// Hanya server/service internal yang tahu nilai ini
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(req: Request) {
  try {
    // [VULN-03 FIX] Validasi Authorization header
    // Caller wajib mengirim: Authorization: Bearer <INTERNAL_API_SECRET>
    const authHeader = req.headers.get('authorization');
    if (!INTERNAL_API_SECRET || authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
      console.warn('[Push Notify] Unauthorized request — invalid or missing Authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    webpush.setVapidDetails(
      'mailto:admin@agritiva.app',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'dummy_public_key',
      process.env.VAPID_PRIVATE_KEY || 'dummy_private_key'
    );

    const { title, body, url, user_id } = await req.json();

    // Validasi input wajib
    if (!title || !body) {
      return NextResponse.json({ error: 'title dan body wajib diisi' }, { status: 400 });
    }

    let query = supabase.from('push_subscriptions').select('*');

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('[Push Notify] DB Error:', error.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({ title, body, url });

    const sendPromises = subscriptions.map((sub) => {
      return webpush.sendNotification(sub.subscription, payload).catch((err) => {
        console.error('Error sending push to endpoint:', sub.subscription.endpoint, err);
        // Hapus subscription yang sudah expired/invalid
        if (err.statusCode === 410 || err.statusCode === 404) {
          return supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sentCount: subscriptions.length });
  } catch (error: any) {
    console.error('Notify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
