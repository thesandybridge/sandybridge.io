import { NextRequest, NextResponse } from 'next/server';
import { recordPresence } from '@/lib/presence';

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    const ip = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await recordPresence(ip, userAgent, path || '/');

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
