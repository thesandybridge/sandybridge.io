import { join } from 'path'
import server from './dist/server/server.js'

const port = Number(process.env.PORT || 3000)
const clientDir = join(import.meta.dirname, 'dist', 'client')

Bun.serve({
  port,
  hostname: '0.0.0.0',
  async fetch(request) {
    const url = new URL(request.url)

    // Serve static files from dist/client
    const filePath = join(clientDir, url.pathname)
    const file = Bun.file(filePath)
    if (await file.exists()) {
      return new Response(file)
    }

    // Fall through to TanStack Start handler
    return server.fetch(request)
  },
})

console.log(`Server listening on http://0.0.0.0:${port}`)
