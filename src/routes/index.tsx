import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/content'

const fetchPosts = createServerFn({ method: 'GET' }).handler(async () => {
  return getAllPosts('blog')
})

export const Route = createFileRoute('/')({
  loader: () => fetchPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <div>
      <h1>Posts: {posts.length}</h1>
      {posts.map((p) => (
        <div key={p.slug}>{p.title}</div>
      ))}
    </div>
  )
}
