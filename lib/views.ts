import crypto from 'crypto';
import redis from '@/lib/redis';

const BOT_RE = /bot|crawl|spider|slurp|Googlebot|bingbot|Bytespider|GPTBot|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|DuckDuckBot|Baiduspider|YandexBot|Sogou|ia_archiver|AhrefsBot|SemrushBot|DotBot|MJ12bot|PetalBot/i;

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return '127.0.0.1';
}

export function isBot(ua: string | null): boolean {
  if (!ua) return true;
  return BOT_RE.test(ua);
}

function dedupKey(ip: string, slug: string): string {
  const hash = crypto.createHash('sha256').update(`${ip}:${slug}`).digest('hex');
  return `dedup:${hash}`;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

const DAILY_TTL = 90 * 24 * 60 * 60; // 90 days in seconds
const DEDUP_TTL = 24 * 60 * 60;      // 24 hours in seconds

export async function recordView(slug: string, req: Request): Promise<number | null> {
  if (!redis) return null;

  const ua = req.headers.get('user-agent');
  if (isBot(ua)) return null;

  const ip = getClientIP(req);
  const dk = dedupKey(ip, slug);

  // Check if already viewed in last 24h
  const existing = await redis.get(dk);
  if (existing !== null) {
    // Already counted — return current total without incrementing
    const current = await redis.get(`views:${slug}`);
    return current ? parseInt(current, 10) : 0;
  }

  // Mark as seen for 24h
  await redis.set(dk, '', 'EX', DEDUP_TTL);

  // Increment lifetime total
  const views = await redis.incr(`views:${slug}`);

  // Increment daily counter with TTL
  const date = todayStr();
  const dailyKey = `daily:${slug}:${date}`;
  await redis.incr(dailyKey);
  await redis.expire(dailyKey, DAILY_TTL);

  return views;
}
