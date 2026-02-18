import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const runtime = 'nodejs';

async function scanKeys(pattern: string): Promise<string[]> {
  if (!redis) return [];
  const keys = new Set<string>();
  let cursor = '0';
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = next;
    for (const k of batch) keys.add(k);
  } while (cursor !== '0');
  return Array.from(keys);
}

export async function GET() {
  if (!redis) {
    return NextResponse.json({});
  }

  try {
    const keys = await scanKeys('views:*');
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
