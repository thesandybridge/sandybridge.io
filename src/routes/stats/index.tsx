import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import metadata from '~/generated/build-metadata.json'
import { getContributions } from '~/lib/server/github'
import { getAllPosts, getAllTags } from '~/lib/server/content'
import { CoronaReveal } from '~/components/effects'
import { GitHubContributions } from '~/components/features'
import { TextScramble } from '~/components/home'
import tagStyles from '~/components/blog/tags.module.css'
import sc from '~/components/analytics/SummaryCards.module.css'

const fetchStats = createServerFn({ method: 'GET' }).handler(async () => {
  const blogPosts = getAllPosts('blog')
  const portfolioItems = getAllPosts('portfolio')
  const tags = getAllTags()
  const { totalWords, codeLines, buildDate } = metadata.site
  const contributions = await getContributions('thesandybridge')

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
    buildDate,
    contributions,
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
  const { statCards, sortedTags, newest, oldest, buildDate, contributions } = Route.useLoaderData()

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
      <GitHubContributions username="thesandybridge" contributions={contributions} />

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
