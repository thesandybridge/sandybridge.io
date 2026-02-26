import { createFileRoute } from '@tanstack/react-router'
import { getPresence } from '~/lib/presence'

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
    },
  },
})
