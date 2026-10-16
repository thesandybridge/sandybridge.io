import { createFileRoute } from '@tanstack/react-router'
import redis from '~/lib/redis'
import { recordView } from '~/lib/views'

import { isPublicSlug } from '~/lib/public-content'

export const Route = createFileRoute('/api/views/$slug')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { slug } = params
        if (!isPublicSlug(slug)) return new Response('Not found', { status: 404 })
        if (redis?.status !== 'ready') {
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
