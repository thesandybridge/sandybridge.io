import { createServerFn } from '@tanstack/react-start'
import {
  getAllPosts,
  getPost,
  getAdjacentPosts,
  getRelatedPosts,
  getSeriesPosts,
  getPostsByTag,
  getAllTags,
  extractHeadings,
  type ContentDir,
} from '~/lib/content'

export const fetchAllPosts = createServerFn({ method: 'GET' })
  .inputValidator((data: { dir: ContentDir; limit?: number }) => data)
  .handler(async ({ data }) => {
    return getAllPosts(data.dir, data.limit)
  })

export const fetchPost = createServerFn({ method: 'GET' })
  .inputValidator((data: { dir: ContentDir; slug: string }) => data)
  .handler(async ({ data }) => {
    const post = await getPost(data.dir, data.slug)
    if (!post) throw new Error('Not found')
    const adjacent = getAdjacentPosts(data.dir, data.slug)
    const headings = extractHeadings(post.rawContent)
    const related = data.dir === 'blog' ? getRelatedPosts(data.slug, post.tags) : []
    const series = post.series ? getSeriesPosts(post.series) : []
    return { post, adjacent, headings, related, series }
  })

export const fetchPostsByTag = createServerFn({ method: 'GET' })
  .inputValidator((tag: string) => tag)
  .handler(async ({ data: tag }) => {
    return { tag, posts: getPostsByTag(tag) }
  })

export const fetchAllTags = createServerFn({ method: 'GET' }).handler(async () => {
  return getAllTags()
})
