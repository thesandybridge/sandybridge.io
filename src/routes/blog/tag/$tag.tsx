import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchPostsByTag } from '~/lib/server/content-fns'

export const Route = createFileRoute('/blog/tag/$tag')({
  loader: ({ params }) => fetchPostsByTag({ data: params.tag }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Posts tagged "${loaderData?.tag}" | sandybridge.io` },
      { name: 'description', content: `Blog posts tagged with ${loaderData?.tag}.` },
    ],
  }),
  component: TagPage,
})

function TagPage() {
  const { tag, posts } = Route.useLoaderData()

  return (
    <>
      <h1>Posts tagged &ldquo;{tag}&rdquo;</h1>
      <nav>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to="/blog/$slug" params={{ slug: post.slug }}>
                <h3>{post.title}</h3>
                {post.date && <time dateTime={post.date}>{post.date}</time>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p><Link to="/blog">&larr; All posts</Link></p>
    </>
  )
}
