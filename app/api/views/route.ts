import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
  if (!redis) {
    return NextResponse.json({});
  }

  try {
    const keys = await redis.keys('views:*');
    if (keys.length === 0) return NextResponse.json({});

    const values = await redis.mget(...keys);
    const counts: Record<string, number> = {};
    keys.forEach((key, i) => {
      counts[key.replace('views:', '')] = parseInt(values[i] ?? '0', 10);
    });

    return NextResponse.json(counts, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
    });
  } catch {
    return NextResponse.json({});
  }
}
