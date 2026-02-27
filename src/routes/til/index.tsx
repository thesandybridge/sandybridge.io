import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchAllPosts } from '~/lib/server/content-fns'
import { CoronaReveal } from '~/components/effects'
import { TextScramble } from '~/components/home'
import s from '~/styles/til.module.css'

export const Route = createFileRoute('/til/')({
  loader: () => fetchAllPosts({ data: { dir: 'til' } }),
  head: () => ({
    meta: [
      { title: 'TIL | sandybridge.io' },
      { name: 'description', content: 'Today I Learned - Quick tips, tricks, and discoveries.' },
    ],
  }),
  component: TILIndex,
})

function TILIndex() {
  const posts = Route.useLoaderData()

  return (
    <>
      <TextScramble>Today I Learned</TextScramble>
      <p>Short posts about things I learn day to day. Quick tips, tricks, commands, and discoveries worth remembering.</p>
      <nav>
        <ul className={s.list}>
          {posts.map((post, i) => (
            <CoronaReveal as="li" key={post.slug} delay={Math.min(i * 40, 400)}>
              <Link to="/til/$slug" params={{ slug: post.slug }}>
                <h3>{post.title}</h3>
                <div className={s.meta}>
                  {post.date && <time dateTime={post.date}>{post.date}</time>}
                  {post.tags.length > 0 && (
                    <span className={s.tags}>
                      {post.tags.map((tag) => (
                        <span key={tag} className={s.tag}>{tag}</span>
                      ))}
                    </span>
                  )}
                </div>
              </Link>
            </CoronaReveal>
          ))}
        </ul>
      </nav>
      {posts.length === 0 && (
        <p className={s.emptyState}>No TIL posts yet. Check back soon!</p>
      )}
    </>
  )
}
