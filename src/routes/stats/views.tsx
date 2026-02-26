import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/content'
import { ViewsDashboard } from '~/components/analytics/ViewsDashboard'

const fetchPostsForViews = createServerFn({ method: 'GET' }).handler(async () => {
  return getAllPosts('blog').map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
  }))
})

export const Route = createFileRoute('/stats/views')({
  loader: () => fetchPostsForViews(),
  head: () => ({
    meta: [
      { title: 'View Analytics | sandybridge.io' },
      { name: 'description', content: 'Blog post view analytics and visualizations.' },
    ],
  }),
  component: ViewStatsPage,
})

function ViewStatsPage() {
  const posts = Route.useLoaderData()

  return (
    <>
      <h1>View Analytics</h1>
      <p>Visualizations of blog post view data over time.</p>
      <ViewsDashboard posts={posts} />
    </>
  )
}
