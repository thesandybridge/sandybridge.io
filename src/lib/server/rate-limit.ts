import redis from '~/lib/server/redis';

const fallback = new Map<string, { count: number; expires: number }>();

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (redis?.status === 'ready') {
    try {
      const current = await redis.eval(
        "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n",
        1, key, windowSeconds,
      );
      return Number(current) <= limit;
    } catch { /* Use a bounded per-process limit during outages. */ }
  }
  const now = Date.now();
  for (const [key, value] of fallback) if (value.expires <= now) fallback.delete(key);
  let entry = fallback.get(key);
  if (!entry) {
    if (fallback.size >= 10000) return false;
    entry = { count: 0, expires: now + windowSeconds * 1000 };
    fallback.set(key, entry);
  }
  return ++entry.count <= limit;
}
