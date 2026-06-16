import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase'; // Service role key if needed, or normal client

export async function POST(req: Request) {
  try {
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'dummy_public_key',
      process.env.VAPID_PRIVATE_KEY || 'dummy_private_key'
    );
    // In production, you should authenticate this endpoint (e.g. secret key or admin check)
    // For now, it's open for demonstration

    const { title, body, url, user_id } = await req.json();

    let query = supabase.from('push_subscriptions').select('*');
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({ title, body, url });

    const sendPromises = subscriptions.map((sub) => {
      return webpush.sendNotification(sub.subscription, payload).catch((err) => {
        console.error('Error sending push to endpoint:', sub.subscription.endpoint, err);
        // Optionally delete expired/invalid subscriptions here
        if (err.statusCode === 410 || err.statusCode === 404) {
           return supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sentCount: subscriptions.length });
  } catch (error: any) {
    console.error('Notify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
