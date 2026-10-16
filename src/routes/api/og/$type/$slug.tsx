import { createFileRoute } from '@tanstack/react-router'
import { getAllPosts, type ContentDir } from '~/lib/content'
import { rateLimit } from '~/lib/rate-limit'
import { getClientIP } from '~/lib/views'
import fontBase64 from '~/assets/fonts/KodeMono-Regular.woff?inline'

// Embed a supported font into the server bundle, independent of the runtime filesystem.
const fontData = Buffer.from(fontBase64.split(',')[1], 'base64')
const images = new Map<string, Uint8Array>()
let rendering = false

export const Route = createFileRoute('/api/og/$type/$slug')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
    if (!['blog', 'portfolio', 'til'].includes(params.type)) return new Response('Not found', { status: 404 })
    const post = getAllPosts(params.type as ContentDir).find(post => post.slug === params.slug)
    if (!post) return new Response('Not found', { status: 404 })
    const key = `${params.type}/${params.slug}`
    const headers = { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' }
    const cached = images.get(key)
    if (cached) return new Response(new Uint8Array(cached), { headers })
    if (!await rateLimit(`og:${getClientIP(request)}`, 30, 60) || rendering) {
      return new Response('Try again later', { status: 429, headers: { 'Retry-After': '5' } })
    }
    rendering = true
    try {
    const [{ default: satori }, { Resvg }] = await Promise.all([import('satori'), import('@resvg/resvg-js')])
    const title = post?.title || params.slug
    const date = post?.date || ''
    const tags = post?.tags || []

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: '60px 80px', background: '#151515',
            fontFamily: 'Kode Mono',
          },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: 16 },
                children: [
                  { type: 'div', props: { style: { fontSize: 28, color: '#928374' }, children: 'sandybridge.io' } },
                  { type: 'div', props: { style: { fontSize: 56, color: '#d79921', lineHeight: 1.2, maxWidth: '90%' }, children: title } },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', gap: 12 },
                      children: tags.slice(0, 4).map((tag: string) => ({
                        type: 'div',
                        props: {
                          style: { fontSize: 20, color: '#928374', border: '1px solid #303030', borderRadius: 4, padding: '4px 12px' },
                          children: tag,
                        },
                      })),
                    },
                  },
                  ...(date ? [{ type: 'div', props: { style: { fontSize: 22, color: '#928374' }, children: date } }] : []),
                ],
              },
            },
          ],
        },
      } as any,
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Kode Mono', data: fontData, weight: 400, style: 'normal' as const }],
      },
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width' as const, value: 1200 } })
    const pngData = resvg.render().asPng()

    if (images.size >= 32) images.delete(images.keys().next().value!)
    images.set(key, new Uint8Array(pngData))
    return new Response(new Uint8Array(pngData), { headers })
    } finally {
      rendering = false
    }
      },
    },
  },
})
