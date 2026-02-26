import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { renderMarkdown } from '~/lib/content'

const fetchNowContent = createServerFn({ method: 'GET' }).handler(async () => {
  const filePath = path.join(process.cwd(), 'content/pages/now.md')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content } = matter(raw)
  const html = await renderMarkdown(content)
  return html
})

export const Route = createFileRoute('/now')({
  loader: () => fetchNowContent(),
  head: () => ({
    meta: [
      { title: 'Now | sandybridge.io' },
      { name: 'description', content: "What I'm currently focused on." },
    ],
  }),
  component: NowPage,
})

function NowPage() {
  const html = Route.useLoaderData()

  return (
    <>
      <h1>Now</h1>
      <p>What I&apos;m currently focused on and working towards.</p>
      {/* Content is trusted server-rendered markdown from local .md files */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
