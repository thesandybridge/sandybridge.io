import { createFileRoute } from '@tanstack/react-router'
import { fetchAllPosts } from '~/lib/server/content-fns'

export const Route = createFileRoute('/')({
  loader: () => fetchAllPosts({ data: { dir: 'blog', limit: 5 } }),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <div>
      <h1>sandybridge.io</h1>
      <p>Placeholder homepage — will be ported in Task 20</p>
      <h2>Recent Posts</h2>
      {posts.map((p) => (
        <div key={p.slug}>{p.title}</div>
      ))}
    </div>
  )
}
