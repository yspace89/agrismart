import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // Hapus subscription lama jika endpoint-nya sama agar tidak duplikat
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .contains('subscription', { endpoint: subscription.endpoint });

    // Insert yang baru
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: user.id,
        subscription: subscription,
      });

    if (error) {
      console.error('Error saving subscription:', error);
      return NextResponse.json({ error: 'Database error', detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Subscribe Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: 'endpoint wajib diisi' }, { status: 400 });

    await supabase.from('push_subscriptions').delete().eq('user_id', user.id).contains('subscription', { endpoint });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
