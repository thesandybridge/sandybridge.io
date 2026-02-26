import { createFileRoute } from '@tanstack/react-router'
import { generateSearchIndex } from '~/lib/search-index'

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async () => {
        const index = generateSearchIndex()
        return Response.json(index)
      },
    },
  },
})
