import { createFileRoute } from '@tanstack/react-router'
import redis from '~/lib/server/redis'
import { getClientIP, isBot } from '~/lib/server/views'
import { isPublicSlug } from '~/lib/server/public-content'
import { rateLimit } from '~/lib/server/rate-limit'

export const Route = createFileRoute('/api/views/$slug/depth')({
  server: { handlers: { POST: async ({ request, params }) => {
    if (!isPublicSlug(params.slug)) return new Response('Not found', { status: 404 })
    let body
    try { body = await request.json() } catch { return new Response('Invalid JSON', { status: 400 }) }
    if (!body || !Number.isInteger(body.depth) || body.depth < 10 || body.depth > 100 || body.depth % 10 !== 0) {
      return new Response('Invalid depth', { status: 400 })
    }
    if (isBot(request.headers.get('user-agent')) || redis?.status !== 'ready') return Response.json({ ok: false })
    if (!await rateLimit(`depth-limit:${getClientIP(request)}:${params.slug}`, 1, 86400)) return Response.json({ ok: false })
    try {
      await redis.incr(`depth:${params.slug}:${body.depth}`)
      return Response.json({ ok: true })
    } catch { return Response.json({ ok: false }) }
  } } },
})
