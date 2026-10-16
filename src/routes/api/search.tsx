import { createFileRoute } from '@tanstack/react-router'
import { generateSearchIndex } from '~/lib/server/search-index'

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async () => {
        const index = generateSearchIndex()
        return Response.json(index, { headers: { 'Cache-Control': 'public, max-age=300' } })
      },
    },
  },
})
