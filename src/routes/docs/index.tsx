import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllDocs } from '~/lib/docs'
import s from '~/styles/docs.module.css'

const fetchDocs = createServerFn({ method: 'GET' }).handler(async () => {
  return getAllDocs()
})

export const Route = createFileRoute('/docs/')({
  loader: () => fetchDocs(),
  head: () => ({
    meta: [
      { title: 'Documentation | sandybridge.io' },
      { name: 'description', content: 'Project documentation' },
    ],
  }),
  component: DocsIndex,
})

function DocsIndex() {
  const docs = Route.useLoaderData()

  return (
    <>
      <h1>Documentation</h1>
      <p className={s.subtitle}>Everything you need to get started.</p>
      {docs.length === 0 ? (
        <p>No documentation found. Add MDX files to <code>content/docs/</code>.</p>
      ) : (
        <div className={s.grid}>
          {docs.map((doc) => (
            <Link key={doc.slug} to={`/docs/${doc.slug}`} className={s.card}>
              <h2>{doc.title}</h2>
              {doc.description && <p>{doc.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
