import Redis from 'ioredis';

export function createRedisClient(url = process.env.REDIS_URL): Redis | null {
  if (!url) return null;
  try {
    const client = new Redis(url, {
      // Railway private networks may resolve only IPv6 in older environments.
      family: 0,
      connectTimeout: 3000,
      commandTimeout: 2000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (attempt) => Math.min(1000 * 2 ** Math.min(attempt - 1, 5), 30000),
    });
    let lastWarning = 0;
    client.on('error', (error: NodeJS.ErrnoException) => {
      if (Date.now() - lastWarning < 60000) return;
      lastWarning = Date.now();
      // Never log connection URLs or credentials.
      console.warn('Redis unavailable:', error.code || error.name);
    });
    return client;
  } catch {
    console.warn('Redis configuration is invalid');
    return null;
  }
}

const globalForRedis = globalThis as typeof globalThis & { _redis?: Redis | null };
if (globalForRedis._redis === undefined) globalForRedis._redis = createRedisClient();
export default globalForRedis._redis;
