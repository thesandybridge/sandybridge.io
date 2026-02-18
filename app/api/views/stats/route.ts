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
    return NextResponse.json({ totals: {}, daily: {}, summary: { totalViews: 0, viewsThisWeek: 0, topPost: '' } });
  }

  try {
    // Fetch lifetime totals
    const viewKeys = await scanKeys('views:*');
    const totals: Record<string, number> = {};
    if (viewKeys.length > 0) {
      const values = await redis.mget(...viewKeys);
      viewKeys.forEach((key, i) => {
        totals[key.replace('views:', '')] = parseInt(values[i] ?? '0', 10);
      });
    }

    // Fetch daily counters
    const dailyKeys = await scanKeys('daily:*');
    const daily: Record<string, Record<string, number>> = {};
    if (dailyKeys.length > 0) {
      const values = await redis.mget(...dailyKeys);
      dailyKeys.forEach((key, i) => {
        // key format: daily:{slug}:{YYYY-MM-DD}
        const parts = key.split(':');
        const date = parts.pop()!;
        const slug = parts.slice(1).join(':');
        if (!daily[date]) daily[date] = {};
        daily[date][slug] = parseInt(values[i] ?? '0', 10);
      });
    }

    // Compute summary
    const totalViews = Object.values(totals).reduce((s, v) => s + v, 0);

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0];

    let viewsThisWeek = 0;
    for (const [date, slugCounts] of Object.entries(daily)) {
      if (date >= weekStr) {
        viewsThisWeek += Object.values(slugCounts).reduce((s, v) => s + v, 0);
      }
    }

    let topPost = '';
    let topViews = 0;
    for (const [slug, views] of Object.entries(totals)) {
      if (views > topViews) {
        topViews = views;
        topPost = slug;
      }
    }

    return NextResponse.json(
      { totals, daily, summary: { totalViews, viewsThisWeek, topPost } },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' } },
    );
  } catch {
    return NextResponse.json({ totals: {}, daily: {}, summary: { totalViews: 0, viewsThisWeek: 0, topPost: '' } });
  }
}
