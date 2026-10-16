import { createFileRoute } from '@tanstack/react-router'
import { getClientIP, isBot } from '~/lib/server/views'
import { rateLimit } from '~/lib/server/rate-limit'
import { getPresence, recordPresence } from '~/lib/server/presence'

export const Route = createFileRoute('/api/presence')({
  server: {
    handlers: {
      GET: async () => {
        const data = await getPresence()
        return Response.json(data, {
          headers: {
            'Cache-Control': 's-maxage=5, stale-while-revalidate',
          },
        })
      },
      POST: async ({ request }) => {
        const ip = getClientIP(request)
        if (isBot(request.headers.get('user-agent'))) return Response.json({ ok: true })
        if (!await rateLimit(`presence:${ip}`, 30, 60)) return new Response('Too many requests', { status: 429 })
        const userAgent = request.headers.get('user-agent') || ''
        let path = '/'
        try {
          const body = await request.json()
          if (!body || typeof body.path !== 'string' || body.path.length > 300 || !/^\/[a-zA-Z0-9_/'\-]*$/.test(body.path)) return new Response('Invalid path', { status: 400 })
          path = body.path
        } catch {
          return new Response('Invalid JSON', { status: 400 })
        }
        await recordPresence(ip, userAgent, path)
        return Response.json({ ok: true })
      },
    },
  },
})
