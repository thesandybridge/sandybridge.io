import { serveStatic } from './scripts/static-files'
import { join } from 'path'
import server from './dist/server/server.js'

const port = Number(process.env.PORT || 3000)
const clientDir = join(import.meta.dirname, 'dist', 'client')

Bun.serve({
  port,
  maxRequestBodySize: 16 * 1024,
  hostname: '0.0.0.0',
  async fetch(request) {
    const staticResponse = await serveStatic(request, clientDir)
    if (staticResponse) return staticResponse

    // Fall through to TanStack Start handler
    return server.fetch(request)
  },
})

console.log(`Server listening on http://0.0.0.0:${port}`)
