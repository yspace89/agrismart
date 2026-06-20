import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

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

// GET /api/reminders?plant_id=xxx
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const plantId = searchParams.get('plant_id');

  let query = supabase
    .from('plant_reminders')
    .select('*, plants(name)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/reminders
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { plant_id, activity_type, frequency_days, notification_hour, notification_minute } = body;

  if (!plant_id || !activity_type || !frequency_days || notification_hour === undefined) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  const minute = notification_minute ?? 0;
  const nextSendAt = calcNextSendAt(Number(frequency_days), Number(notification_hour), Number(minute));

  const { data, error } = await supabase
    .from('plant_reminders')
    .insert({
      created_by: user.id,
      plant_id,
      activity_type,
      frequency_days: Number(frequency_days),
      notification_hour: Number(notification_hour),
      notification_minute: Number(minute),
      is_active: true,
      next_send_at: nextSendAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/reminders?id=xxx
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.activity_type) updates.activity_type = body.activity_type;
  if (body.frequency_days) {
    updates.frequency_days = Number(body.frequency_days);
  }
  if (body.notification_hour !== undefined) {
    updates.notification_hour = Number(body.notification_hour);
  }
  if (body.notification_minute !== undefined) {
    updates.notification_minute = Number(body.notification_minute);
  }

  // Recalculate next_send_at if schedule changed
  if (body.frequency_days || body.notification_hour !== undefined || body.notification_minute !== undefined) {
    const freq = body.frequency_days || 1;
    const hour = body.notification_hour ?? 7;
    const minute = body.notification_minute ?? 0;
    updates.next_send_at = calcNextSendAt(Number(freq), Number(hour), Number(minute));
  }

  const { data, error } = await supabase
    .from('plant_reminders')
    .update(updates)
    .eq('id', id)
    .eq('created_by', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/reminders?id=xxx
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });

  const { error } = await supabase
    .from('plant_reminders')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
