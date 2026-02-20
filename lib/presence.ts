import crypto from 'crypto';
import redis from './redis';

const PRESENCE_TTL = 30; // seconds
const ACTIVE_KEY = 'presence:active';
const RECENT_KEY = 'presence:recent';

export interface PresenceData {
  total: number;
  recentPages: Array<{ path: string; timestamp: number }>;
}

function hashVisitor(ip: string, userAgent: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex')
    .slice(0, 12);
}

export async function recordPresence(ip: string, userAgent: string, path: string): Promise<void> {
  if (!redis) return;

  try {
    const visitorId = hashVisitor(ip, userAgent);
    const now = Date.now();
    const cutoff = now - PRESENCE_TTL * 1000;

    // Add/update visitor in active set with current timestamp
    await redis.zadd(ACTIVE_KEY, now, visitorId);

    // Remove stale entries
    await redis.zremrangebyscore(ACTIVE_KEY, '-inf', cutoff);

    // Track recent page visits (keep last 20)
    const entry = JSON.stringify({ path, timestamp: now });
    await redis.lpush(RECENT_KEY, entry);
    await redis.ltrim(RECENT_KEY, 0, 19);
  } catch {
    // Silently fail - presence is non-critical
  }
}

export async function getPresence(): Promise<PresenceData> {
  if (!redis) return { total: 0, recentPages: [] };

  try {
    const now = Date.now();
    const cutoff = now - PRESENCE_TTL * 1000;

    // Clean up stale entries first
    await redis.zremrangebyscore(ACTIVE_KEY, '-inf', cutoff);

    // Get active visitor count
    const total = await redis.zcard(ACTIVE_KEY);

    // Get recent page visits
    const recentRaw = await redis.lrange(RECENT_KEY, 0, 9);
    const recentPages = recentRaw
      .map((entry) => {
        try {
          return JSON.parse(entry) as { path: string; timestamp: number };
        } catch {
          return null;
        }
      })
      .filter((p): p is { path: string; timestamp: number } => p !== null);

    return { total, recentPages };
  } catch {
    return { total: 0, recentPages: [] };
  }
}
