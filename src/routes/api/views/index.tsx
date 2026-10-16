import { createFileRoute } from '@tanstack/react-router'
import redis from '~/lib/redis'
import { rateLimit } from '~/lib/rate-limit'
import { getClientIP } from '~/lib/views'

import { publicViewKeys } from '~/lib/public-content'


export const Route = createFileRoute('/api/views/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!await rateLimit(`analytics-read:${getClientIP(request)}`, 60, 60)) return new Response('Too many requests', { status: 429 })
        if (redis?.status !== 'ready') {
          return Response.json({})
        }

        try {
          const keys = publicViewKeys('views')
          if (keys.length === 0) return Response.json({})

          const values = await redis.mget(...keys)
          const counts: Record<string, number> = {}
          keys.forEach((key, i) => {
            if (values[i] === null) return
            counts[key.replace('views:', '')] = parseInt(values[i] ?? '0', 10)
          })

          return Response.json(counts, {
            headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=60' },
          })
        } catch {
          return Response.json({})
        }
      },
    },
  },
})
