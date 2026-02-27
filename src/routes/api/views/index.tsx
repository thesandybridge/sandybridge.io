import { createFileRoute } from '@tanstack/react-router'
import redis from '~/lib/redis'

async function scanKeys(pattern: string): Promise<string[]> {
  if (!redis) return []
  const keys = new Set<string>()
  let cursor = '0'
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = next
    for (const k of batch) keys.add(k)
  } while (cursor !== '0')
  return Array.from(keys)
}

export const Route = createFileRoute('/api/views/')({
  server: {
    handlers: {
      GET: async () => {
        if (!redis) {
          return Response.json({})
        }

        try {
          const keys = await scanKeys('views:*')
          if (keys.length === 0) return Response.json({})

          const values = await redis.mget(...keys)
          const counts: Record<string, number> = {}
          keys.forEach((key, i) => {
            counts[key.replace('views:', '')] = parseInt(values[i] ?? '0', 10)
          })

          return Response.json(counts, {
            headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
          })
        } catch {
          return Response.json({})
        }
      },
    },
  },
})
