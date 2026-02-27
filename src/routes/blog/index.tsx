import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchAllPosts } from '~/lib/server/content-fns'
import { PostViewCounts, TrendingPosts } from '~/components/blog'
import { CoronaReveal } from '~/components/effects'
import { TextScramble } from '~/components/home'

export const Route = createFileRoute('/blog/')({
  loader: () => fetchAllPosts({ data: { dir: 'blog' } }),
  head: () => ({
    meta: [
      { title: 'Blog | sandybridge.io' },
      { name: 'description', content: 'Blog posts, guides, and notes.' },
    ],
  }),
  component: BlogIndex,
})

function BlogIndex() {
  const posts = Route.useLoaderData()

  return (
    <>
      <TextScramble>Blog, Guides, Notes</TextScramble>
      <p>This is collection of blog posts on whatever I feel like writing about, as well as some guides I wrote. I also keep some notes here for personal use that I have marked public.</p>
      <TrendingPosts posts={posts.map((p) => ({ slug: p.slug, title: p.title }))} />
      <nav>
        <ul>
          {posts.map((post, i) => (
            <CoronaReveal as="li" key={post.slug} delay={Math.min(i * 60, 600)}>
              <Link to="/blog/$slug" params={{ slug: post.slug }}>
                <h3 style={{ viewTransitionName: `post-${post.slug}` }}>{post.title}</h3>
                {post.date && <time dateTime={post.date}>{post.date}</time>}
              </Link>
            </CoronaReveal>
          ))}
        </ul>
      </nav>
      <PostViewCounts />
    </>
  )
}
