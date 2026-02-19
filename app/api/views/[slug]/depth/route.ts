import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const runtime = 'nodejs';

const SLUG_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const VALID_DEPTHS = new Set([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!redis || !SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const body = await req.json();
    const depth = Number(body.depth);

    if (!VALID_DEPTHS.has(depth)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await redis.incr(`depth:${slug}:${depth}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
