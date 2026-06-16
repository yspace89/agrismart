import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// {
//   "land_id": "uuid-lahan",
//   "sensor_type": "moisture",
//   "value": 45
// }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.land_id || body.value === undefined) {
      return NextResponse.json({ error: 'Missing land_id or value' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sensor_logs')
      .insert({
        land_id: body.land_id,
        sensor_type: body.sensor_type || 'moisture',
        value: body.value,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting sensor log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('IoT Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
