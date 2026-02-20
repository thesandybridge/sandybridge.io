import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface GrepMatch {
  lineNumber: number;
  content: string;
  before: string[];
  after: string[];
}

interface GrepResult {
  slug: string;
  type: 'blog' | 'portfolio' | 'til';
  title: string;
  matches: GrepMatch[];
}

const contentDir = path.join(process.cwd(), 'content');

function searchFile(
  filePath: string,
  query: RegExp,
  contextLines: number
): GrepMatch[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(raw);
  const lines = content.split('\n');
  const matches: GrepMatch[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (query.test(lines[i])) {
      matches.push({
        lineNumber: i + 1,
        content: lines[i],
        before: lines.slice(Math.max(0, i - contextLines), i),
        after: lines.slice(i + 1, i + 1 + contextLines),
      });
    }
  }

  return matches;
}

function getTitle(filePath: string): string {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(raw);
  return data.title || path.basename(filePath, path.extname(filePath));
}

function searchDirectory(
  dir: string,
  type: 'blog' | 'portfolio' | 'til',
  query: RegExp,
  contextLines: number
): GrepResult[] {
  const results: GrepResult[] = [];

  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const matches = searchFile(filePath, query, contextLines);

    if (matches.length > 0) {
      results.push({
        slug: file.replace(/\.(md|mdx)$/, ''),
        type,
        title: getTitle(filePath),
        matches,
      });
    }
  }

  return results;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get('q');
  const contextParam = searchParams.get('context');
  const caseInsensitive = searchParams.get('i') !== 'false';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], error: 'Query too short (min 2 chars)' });
  }

  const contextLines = Math.min(Math.max(parseInt(contextParam || '2', 10), 0), 10);

  let query: RegExp;
  try {
    query = new RegExp(q, caseInsensitive ? 'gi' : 'g');
  } catch {
    // If invalid regex, escape special chars and try again
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query = new RegExp(escaped, caseInsensitive ? 'gi' : 'g');
  }

  const results: GrepResult[] = [
    ...searchDirectory(contentDir, 'blog', query, contextLines),
    ...searchDirectory(path.join(contentDir, 'portfolio'), 'portfolio', query, contextLines),
    ...searchDirectory(path.join(contentDir, 'til'), 'til', query, contextLines),
  ];

  // Sort by number of matches (most relevant first)
  results.sort((a, b) => b.matches.length - a.matches.length);

  return NextResponse.json({
    results,
    query: q,
    totalMatches: results.reduce((sum, r) => sum + r.matches.length, 0),
  });
}
