import Redis from 'ioredis';

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    return new Redis(url, { maxRetriesPerRequest: 3 });
  } catch {
    return null;
  }
}

const globalForRedis = globalThis as typeof globalThis & { _redis?: Redis | null };

const redis = globalForRedis._redis ?? createRedisClient();
if (process.env.NODE_ENV !== 'production') globalForRedis._redis = redis;

export default redis;
