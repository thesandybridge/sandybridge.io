import { createFileRoute } from '@tanstack/react-router'
import { getAllPosts, getAllTags } from '~/lib/content'

export const Route = createFileRoute('/api/sitemap')({
  server: {
    handlers: {
      GET: async () => {
        const base = 'https://sandybridge.io'
        const staticPages = [
          { loc: base, freq: 'weekly', priority: '1' },
          { loc: `${base}/blog`, freq: 'weekly', priority: '0.8' },
          { loc: `${base}/portfolio`, freq: 'monthly', priority: '0.8' },
          { loc: `${base}/til`, freq: 'daily', priority: '0.7' },
          { loc: `${base}/now`, freq: 'weekly', priority: '0.5' },
          { loc: `${base}/changelog`, freq: 'weekly', priority: '0.4' },
          { loc: `${base}/colophon`, freq: 'monthly', priority: '0.4' },
        ]

        const blogs = getAllPosts('blog').map((p) => ({
          loc: `${base}/blog/${p.slug}`, lastmod: p.date, freq: 'monthly', priority: '0.6',
        }))
        const tags = getAllTags().map((t) => ({
          loc: `${base}/blog/tag/${t}`, freq: 'weekly', priority: '0.4',
        }))
        const portfolio = getAllPosts('portfolio').map((p) => ({
          loc: `${base}/portfolio/${p.slug}`, lastmod: p.date, freq: 'monthly', priority: '0.6',
        }))
        const til = getAllPosts('til').map((p) => ({
          loc: `${base}/til/${p.slug}`, lastmod: p.date, freq: 'monthly', priority: '0.5',
        }))

        const all = [...staticPages, ...blogs, ...tags, ...portfolio, ...til]
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        })
      },
    },
  },
})
