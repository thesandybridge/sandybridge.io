import { createFileRoute } from '@tanstack/react-router'
import redis from '~/lib/server/redis'
import { rateLimit } from '~/lib/server/rate-limit'
import { getClientIP } from '~/lib/server/views'

import { publicViewKeys } from '~/lib/server/public-content'


export const Route = createFileRoute('/api/views/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!await rateLimit(`analytics-read:${getClientIP(request)}`, 60, 60)) return new Response('Too many requests', { status: 429 })
    if (redis?.status !== 'ready') {
      return Response.json({ totals: {}, daily: {}, summary: { totalViews: 0, viewsThisWeek: 0, topPost: '' } })
    }

    try {
      const viewKeys = publicViewKeys('views')
      const totals: Record<string, number> = {}
      if (viewKeys.length > 0) {
        const values = await redis.mget(...viewKeys)
        viewKeys.forEach((key, i) => {
          if (values[i] === null) return
          totals[key.replace('views:', '')] = parseInt(values[i] ?? '0', 10)
        })
      }

      const dailyKeys = publicViewKeys('daily')
      const daily: Record<string, Record<string, number>> = {}
      if (dailyKeys.length > 0) {
        const values = await redis.mget(...dailyKeys)
        dailyKeys.forEach((key, i) => {
          if (values[i] === null) return
          const parts = key.split(':')
          const date = parts.pop()!
          const slug = parts.slice(1).join(':')
          if (!daily[date]) daily[date] = {}
          daily[date][slug] = parseInt(values[i] ?? '0', 10)
        })
      }

      const totalViews = Object.values(totals).reduce((s, v) => s + v, 0)

      const now = new Date()
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekStr = weekAgo.toISOString().split('T')[0]

      let viewsThisWeek = 0
      for (const [date, slugCounts] of Object.entries(daily)) {
        if (date >= weekStr) {
          viewsThisWeek += Object.values(slugCounts).reduce((s, v) => s + v, 0)
        }
      }

      let topPost = ''
      let topViews = 0
      for (const [slug, views] of Object.entries(totals)) {
        if (views > topViews) {
          topViews = views
          topPost = slug
        }
      }

      return Response.json(
        { totals, daily, summary: { totalViews, viewsThisWeek, topPost } },
        { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=60' } },
      )
    } catch {
      return Response.json({ totals: {}, daily: {}, summary: { totalViews: 0, viewsThisWeek: 0, topPost: '' } })
    }
      },
    },
  },
})
