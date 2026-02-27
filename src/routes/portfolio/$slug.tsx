import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { fetchPost } from '~/lib/server/content-fns'
import { getWorkflowRuns, parseGitHubUrl, type WorkflowRun } from '~/lib/github'
import { IslandHydrator } from '~/components/mdx/IslandHydrator'
import { CopyButton, Lightbox } from '~/components/ui'
import { HeadingAnchors, Share } from '~/components/blog'
import { ProjectLinks, StatusBadges } from '~/components/features'
import { BLUR_DATA_URL } from '~/lib/blur-placeholder'
import pm from '~/components/blog/post-meta.module.css'
import tagStyles from '~/components/blog/tags.module.css'
import p from '~/components/features/PortfolioGrid.module.css'

const fetchWorkflows = createServerFn({ method: 'GET' })
  .inputValidator((data: { github?: string }) => data)
  .handler(async ({ data }) => {
    if (!data.github) return [] as WorkflowRun[]
    const parsed = parseGitHubUrl(data.github)
    if (!parsed) return [] as WorkflowRun[]
    return getWorkflowRuns(parsed.owner, parsed.repo)
  })

export const Route = createFileRoute('/portfolio/$slug')({
  loader: async ({ params }) => {
    try {
      const postData = await fetchPost({ data: { dir: 'portfolio', slug: params.slug } })
      const workflowRuns = await fetchWorkflows({ data: { github: postData.post.github } })
      return { ...postData, workflowRuns }
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
        ...(loaderData.post.image ? [{ property: 'og:image', content: `/assets/portfolio/${loaderData.post.image}` }] : []),
      ],
    }
  },
  component: PortfolioItem,
  notFoundComponent: () => <div>Project not found</div>,
})

function PortfolioItem() {
  const { post, workflowRuns } = Route.useLoaderData()

  return (
    <>
      <Link to="/portfolio" className={pm.backLink}>&larr; Back to Portfolio</Link>
      <article>
        <ProjectLinks github={post.github} url={post.url} blog={post.blog} npm={post.npm} />
        <StatusBadges runs={workflowRuns} />
        {post.image && (
          <img
            src={`/assets/portfolio/${post.image}`}
            alt={post.title}
            className={p.portfolioHero}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: 'auto', backgroundImage: `url(${BLUR_DATA_URL})`, backgroundSize: 'cover' }}
          />
        )}
        {post.date && <time className={pm.postDate} dateTime={post.date}>{post.date}</time>}
        {post.tags.length > 0 && (
          <div className={tagStyles.postTags}>
            {post.tags.map((tag) => (
              <Link key={tag} to="/blog/tag/$tag" params={{ tag }} className={tagStyles.tag}>{tag}</Link>
            ))}
          </div>
        )}
        <Share title={post.title} />
        <IslandHydrator html={post.content} />
      </article>
      <CopyButton />
      <HeadingAnchors />
      <Lightbox />
    </>
  )
}
