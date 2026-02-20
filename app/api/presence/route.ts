import { NextResponse } from 'next/server';
import { getPresence } from '@/lib/presence';

export async function GET() {
  const data = await getPresence();

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 's-maxage=5, stale-while-revalidate',
    },
  });
}
