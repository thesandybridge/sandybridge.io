import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { fetchPost } from '~/lib/server/content-fns'
import { IslandHydrator } from '~/components/mdx/IslandHydrator'
import { CopyButton, Lightbox } from '~/components/ui'
import { HeadingAnchors, Share, ReadingProgress, TableOfContents, SeriesNav, Giscus, ViewCounter, ResumeReading } from '~/components/blog'
import { cx } from '~/lib/cx'
import pm from '~/components/blog/post-meta.module.css'
import tagStyles from '~/components/blog/tags.module.css'
import nav from '~/components/blog/post-nav.module.css'
import bp from '~/styles/blog-post.module.css'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    try {
      return await fetchPost({ data: { dir: 'blog', slug: params.slug } })
    } catch {
      throw notFound()
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    return {
      meta: [
        { title: `${loaderData.post.title} | sandybridge.io` },
        { name: 'description', content: loaderData.post.description },
        { property: 'og:title', content: loaderData.post.title },
        { property: 'og:description', content: loaderData.post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:image', content: `/api/og/blog/${loaderData.post.slug}` },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: loaderData.post.title,
            description: loaderData.post.description,
            datePublished: loaderData.post.date,
            dateModified: loaderData.post.lastModified || loaderData.post.date,
            author: { '@type': 'Person', name: 'Matt Miller', url: 'https://sandybridge.io' },
            publisher: { '@type': 'Person', name: 'Matt Miller' },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://sandybridge.io/blog/${loaderData.post.slug}` },
            keywords: loaderData.post.tags.join(', '),
          }),
        },
      ],
    }
  },
  component: BlogPost,
  notFoundComponent: () => <div>Post not found</div>,
})

function BlogPost() {
  const { post, adjacent, headings, related, series } = Route.useLoaderData()
  const { prev, next } = adjacent
  const showUpdated = post.lastModified && post.lastModified !== post.date

  return (
    <>
      <ReadingProgress />
      <ResumeReading slug={post.slug} />
      <Link to="/blog" className={pm.backLink}>&larr; Back to Blog</Link>
      <article>
        <h1 style={{ viewTransitionName: `post-${post.slug}` }}>{post.title}</h1>
        {post.date && <time className={pm.postDate} dateTime={post.date}>{post.date}</time>}
        {showUpdated && <time className="post-updated" dateTime={post.lastModified}>Updated {post.lastModified}</time>}
        <div className={pm.postMetaLine}>
          {post.readTime > 0 && <span className={pm.readTime}>{post.readTime} min read</span>}
          <ViewCounter slug={post.slug} />
        </div>
        {post.tags.length > 0 && (
          <div className={tagStyles.postTags}>
            {post.tags.map((tag) => (
              <Link key={tag} to={`/blog/tag/${tag}`} className={tagStyles.tag}>{tag}</Link>
            ))}
          </div>
        )}
        <Share title={post.title} />
        {series.length > 1 && (
          <SeriesNav currentSlug={post.slug} seriesPosts={series} seriesName={post.series!} />
        )}
        {headings.length > 2 && <TableOfContents headings={headings} />}
        <IslandHydrator html={post.content} />
      </article>
      {(prev || next) && (
        <nav className={nav.postNav} aria-label="Post navigation" data-nav>
          {prev ? (
            <Link to={`/blog/${prev.slug}`} className={nav.postNavLink}>
              <span className={nav.postNavLabel}>&larr; Previous</span>
              <span className={nav.postNavTitle}>{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/blog/${next.slug}`} className={cx(nav.postNavLink, nav.postNavNext)}>
              <span className={nav.postNavLabel}>Next &rarr;</span>
              <span className={nav.postNavTitle}>{next.title}</span>
            </Link>
          ) : <span />}
        </nav>
      )}
      <Giscus />
      {related.length > 0 && (
        <nav className={bp.relatedPosts} aria-label="Related posts" data-nav>
          <h3>Related Posts</h3>
          <ul>
            {related.map((rp) => (
              <li key={rp.slug}>
                <Link to={`/blog/${rp.slug}`}>
                  <span className={bp.relatedTitle}>{rp.title}</span>
                  <time>{rp.date}</time>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <a href="#content" className={bp.backToTop} aria-label="Back to top">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 12V4M4 7l4-4 4 4" />
        </svg>
      </a>
      <CopyButton />
      <HeadingAnchors />
      <Lightbox />
    </>
  )
}
