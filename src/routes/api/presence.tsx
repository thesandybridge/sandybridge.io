import { createFileRoute } from '@tanstack/react-router'
import { getPresence, recordPresence } from '~/lib/presence'

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
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
        const userAgent = request.headers.get('user-agent') || ''
        let path = '/'
        try {
          const body = await request.json()
          path = body.path || '/'
        } catch {
          // ignore parse errors
        }
        await recordPresence(ip, userAgent, path)
        return Response.json({ ok: true })
      },
    },
  },
})
