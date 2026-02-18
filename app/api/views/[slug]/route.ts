import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const runtime = 'nodejs';

const SLUG_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!redis || !SLUG_RE.test(slug)) {
    return NextResponse.json({ views: null });
  }

  try {
    const views = await redis.incr(`views:${slug}`);
    return NextResponse.json({ views });
  } catch {
    return NextResponse.json({ views: null });
  }
}
