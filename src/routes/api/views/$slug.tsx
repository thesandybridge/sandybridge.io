import { createFileRoute } from '@tanstack/react-router'
import redis from '~/lib/redis'
import { recordView } from '~/lib/views'

const SLUG_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/

export const Route = createFileRoute('/api/views/$slug')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { slug } = params
        if (!redis || !SLUG_RE.test(slug)) {
          return Response.json({ views: null })
        }
        try {
          const views = await recordView(slug, request)
          return Response.json({ views })
        } catch {
          return Response.json({ views: null })
        }
      },
    },
  },
})
