import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.SUMOPOD_API_KEY;
  const baseUrl = process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com/v1';

  if (!apiKey) {
    return NextResponse.json({ status: 'error', message: 'SUMOPOD_API_KEY tidak ditemukan di environment variables.' });
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Halo, ini test koneksi.' }],
        max_tokens: 50,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        status: 'error',
        http_status: res.status,
        detail: data,
        api_key_prefix: apiKey.substring(0, 8) + '...',
        base_url: baseUrl,
      });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Koneksi ke SumoPod berhasil!',
      ai_reply: data?.choices?.[0]?.message?.content,
      model_used: data?.model,
      api_key_prefix: apiKey.substring(0, 8) + '...',
      base_url: baseUrl,
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
      api_key_prefix: apiKey.substring(0, 8) + '...',
      base_url: baseUrl,
    });
  }
}
