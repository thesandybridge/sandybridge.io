import { NextResponse } from 'next/server';
import { generateSearchIndex } from '@/lib/search-index';

export async function GET() {
  const index = generateSearchIndex();
  return NextResponse.json(index);
}
