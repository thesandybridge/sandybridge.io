import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { fetchPost } from '~/lib/server/content-fns'
import { IslandHydrator } from '~/components/mdx/IslandHydrator'
import { CopyButton, Lightbox } from '~/components/ui'
import { cx } from '~/lib/cx'
import pm from '~/components/blog/post-meta.module.css'
import tagStyles from '~/components/blog/tags.module.css'
import nav from '~/components/blog/post-nav.module.css'
import til from '~/styles/til.module.css'

export const Route = createFileRoute('/til/$slug')({
  loader: async ({ params }) => {
    try {
      return await fetchPost({ data: { dir: 'til', slug: params.slug } })
    } catch {
      throw notFound()
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    return {
      meta: [
        { title: `TIL: ${loaderData.post.title} | sandybridge.io` },
        { name: 'description', content: loaderData.post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: `TIL: ${loaderData.post.title}` },
        { property: 'og:description', content: loaderData.post.description },
      ],
    }
  },
  component: TILPost,
  notFoundComponent: () => <div>TIL post not found</div>,
})

function TILPost() {
  const { post, adjacent } = Route.useLoaderData()
  const { prev, next } = adjacent

  return (
    <>
      <Link to="/til" className={pm.backLink}>&larr; Back to TIL</Link>
      <article className={til.article}>
        <h1>{post.title}</h1>
        {post.date && <time className={pm.postDate} dateTime={post.date}>{post.date}</time>}
        {post.tags.length > 0 && (
          <div className={tagStyles.postTags}>
            {post.tags.map((tag) => (
              <span key={tag} className={tagStyles.tag}>{tag}</span>
            ))}
          </div>
        )}
        <IslandHydrator html={post.content} />
      </article>
      {(prev || next) && (
        <nav className={nav.postNav} aria-label="Post navigation" data-nav>
          {prev ? (
            <Link to={`/til/${prev.slug}`} className={nav.postNavLink}>
              <span className={nav.postNavLabel}>&larr; Previous</span>
              <span className={nav.postNavTitle}>{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/til/${next.slug}`} className={cx(nav.postNavLink, nav.postNavNext)}>
              <span className={nav.postNavLabel}>Next &rarr;</span>
              <span className={nav.postNavTitle}>{next.title}</span>
            </Link>
          ) : <span />}
        </nav>
      )}
      <CopyButton />
      <Lightbox />
    </>
  )
}
