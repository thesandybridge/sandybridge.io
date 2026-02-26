import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/content'
import { parseGitHubUrl, getRepoStats, type RepoStats } from '~/lib/github'
import { PortfolioGrid } from '~/components/features'
import { TextScramble } from '~/components/home'

const fetchPortfolio = createServerFn({ method: 'GET' }).handler(async () => {
  const posts = getAllPosts('portfolio')
  const stats: Record<string, RepoStats> = {}
  await Promise.all(
    posts.map(async (p) => {
      if (p.github) {
        const parsed = parseGitHubUrl(p.github)
        if (parsed) {
          const s = await getRepoStats(parsed.owner, parsed.repo)
          if (s) stats[p.slug] = s
        }
      }
    }),
  )
  return { posts, stats }
})

export const Route = createFileRoute('/portfolio/')({
  loader: () => fetchPortfolio(),
  head: () => ({
    meta: [
      { title: 'Portfolio | sandybridge.io' },
      { name: 'description', content: "Projects I've built." },
    ],
  }),
  component: PortfolioIndex,
})

function PortfolioIndex() {
  const { posts, stats } = Route.useLoaderData()
  return (
    <>
      <TextScramble>Portfolio</TextScramble>
      <p>Projects I&apos;ve built.</p>
      <PortfolioGrid items={posts} statsMap={stats} />
    </>
  )
}
