import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import fs from 'fs'
import path from 'path'
import { getAllPosts, getAllTags } from '~/lib/content'
import { CoronaReveal } from '~/components/effects'
import { GitHubContributions } from '~/components/features'
import { TextScramble } from '~/components/home'
import tagStyles from '~/components/blog/tags.module.css'
import sc from '~/components/analytics/SummaryCards.module.css'

function countLines(dir: string, extensions: string[]): number {
  let total = 0
  function walk(d: string) {
    if (!fs.existsSync(d)) return
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) {
        if (['node_modules', '.next', '.git', '.output'].includes(entry.name)) continue
        walk(full)
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(full, 'utf-8')
        total += content.split('\n').length
      }
    }
  }
  walk(dir)
  return total
}

function countWords(dir: string): number {
  let total = 0
  function walk(d: string) {
    if (!fs.existsSync(d)) return
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name.endsWith('.md')) {
        const content = fs.readFileSync(full, 'utf-8')
        total += content.split(/\s+/).filter(Boolean).length
      }
    }
  }
  walk(dir)
  return total
}

const fetchStats = createServerFn({ method: 'GET' }).handler(async () => {
  const blogPosts = getAllPosts('blog')
  const portfolioItems = getAllPosts('portfolio')
  const tags = getAllTags()
  const totalWords = countWords(path.join(process.cwd(), 'content'))
  const codeLines = countLines(process.cwd(), ['.ts', '.tsx', '.css'])

  const tagCounts: Record<string, number> = {}
  for (const post of blogPosts) {
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])
  const readTimeTotal = blogPosts.reduce((sum, p) => sum + p.readTime, 0)
  const newest = blogPosts[0]
  const oldest = blogPosts[blogPosts.length - 1]

  return {
    statCards: [
      { value: String(blogPosts.length), label: 'Blog Posts' },
      { value: String(portfolioItems.length), label: 'Projects' },
      { value: totalWords.toLocaleString(), label: 'Words Written' },
      { value: String(readTimeTotal), label: 'Min Total Read Time' },
      { value: String(tags.length), label: 'Unique Tags' },
      { value: codeLines.toLocaleString(), label: 'Lines of Code' },
    ],
    sortedTags,
    newest: newest ? { date: newest.date } : null,
    oldest: oldest ? { date: oldest.date } : null,
    buildDate: new Date().toISOString().split('T')[0],
  }
})

export const Route = createFileRoute('/stats/')({
  loader: () => fetchStats(),
  head: () => ({
    meta: [
      { title: 'Stats | sandybridge.io' },
      { name: 'description', content: 'Site statistics for sandybridge.io.' },
    ],
  }),
  component: StatsPage,
})

function StatsPage() {
  const { statCards, sortedTags, newest, oldest, buildDate } = Route.useLoaderData()

  return (
    <>
      <TextScramble>Stats</TextScramble>
      <p>Numbers from the build at {buildDate}.</p>

      <div className={sc.grid}>
        {statCards.map((card, i) => (
          <CoronaReveal key={card.label} delay={i * 80}>
            <div className={sc.card}>
              <span className={sc.value}>{card.value}</span>
              <span className={sc.label}>{card.label}</span>
            </div>
          </CoronaReveal>
        ))}
      </div>

      <h2>Tags</h2>
      <div className={tagStyles.postTags} style={{ marginBottom: '2rem' }}>
        {sortedTags.map(([tag, count]) => (
          <span key={tag} className={tagStyles.tag}>{tag} ({count})</span>
        ))}
      </div>

      <h2>GitHub Activity</h2>
      <GitHubContributions username="thesandybridge" />

      {newest && oldest && (
        <>
          <h2>Timeline</h2>
          <p>First post: {oldest.date} &mdash; Latest post: {newest.date}</p>
        </>
      )}

      <h2>Analytics</h2>
      <p><Link to="/stats/views">View analytics dashboard</Link> &mdash; blog post view counts, heatmaps, and visualizations.</p>
    </>
  )
}
