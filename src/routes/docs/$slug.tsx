import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getDocBySlug } from '~/lib/docs'
import { IslandHydrator } from '~/components/mdx/IslandHydrator'
import { CopyButton } from '~/components/ui'
import s from '~/styles/docs.module.css'

const fetchDoc = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const doc = await getDocBySlug(slug)
    if (!doc) throw new Error('Not found')
    // Render markdown server-side
    const { unified } = await import('unified')
    const remarkParse = (await import('remark-parse')).default
    const remarkGfm = (await import('remark-gfm')).default
    const remarkRehype = (await import('remark-rehype')).default
    const rehypeRaw = (await import('rehype-raw')).default
    const rehypeSlug = (await import('rehype-slug')).default
    const rehypeStringify = (await import('rehype-stringify')).default

    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSlug)
      .use(rehypeStringify)
      .process(doc.content)

    return { ...doc, html: String(result) }
  })

export const Route = createFileRoute('/docs/$slug')({
  loader: async ({ params }) => {
    try {
      return await fetchDoc({ data: params.slug })
    } catch {
      throw notFound()
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    return {
      meta: [
        { title: `${loaderData.title} | sandybridge.io` },
        ...(loaderData.description ? [{ name: 'description', content: loaderData.description }] : []),
      ],
    }
  },
  component: DocPage,
  notFoundComponent: () => <div>Document not found</div>,
})

function DocPage() {
  const doc = Route.useLoaderData()

  return (
    <>
      <article>
        <h1>{doc.title}</h1>
        {doc.description && <p className={s.subtitle}>{doc.description}</p>}
        <IslandHydrator html={doc.html} />
      </article>
      <CopyButton />
    </>
  )
}
