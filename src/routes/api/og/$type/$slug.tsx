import { createFileRoute } from '@tanstack/react-router'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getPost, type ContentDir } from '~/lib/content'

const fontData = readFileSync(join(process.cwd(), 'public/fonts/KodeMono-Regular.woff2'))

export const Route = createFileRoute('/api/og/$type/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
    const post = await getPost(params.type as ContentDir, params.slug)
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

    return new Response(new Uint8Array(pngData), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
      },
    },
  },
})
