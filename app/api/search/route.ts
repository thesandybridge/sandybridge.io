import { NextResponse } from 'next/server';
import { generateSearchIndex } from '@/lib/search-index';

export const revalidate = 3600;

export async function GET() {
  const index = generateSearchIndex();
  return NextResponse.json(index);
}
