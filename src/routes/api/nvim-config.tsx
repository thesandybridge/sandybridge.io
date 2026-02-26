import { createFileRoute } from '@tanstack/react-router'
import { codeToHtml } from 'shiki'
import { shikiConfig } from '~/lib/shiki-config'

const GITHUB_OWNER = 'thesandybridge'
const GITHUB_REPO = 'nvim'
const GITHUB_BRANCH = 'main'

interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
}

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T
  }
  return null
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

async function fetchGitHubContents(dirPath: string = ''): Promise<GitHubContent[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dirPath}?ref=${GITHUB_BRANCH}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'sandybridge.io',
    },
  })

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`)
  }

  return res.json()
}

async function buildFileTree(dirPath: string = ''): Promise<FileNode[]> {
  const contents = await fetchGitHubContents(dirPath)
  const nodes: FileNode[] = []

  const sorted = contents.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1
    if (a.type !== 'dir' && b.type === 'dir') return 1
    return a.name.localeCompare(b.name)
  })

  for (const item of sorted) {
    if (item.name.startsWith('.') && !item.name.startsWith('.luarc')) continue
    if (['plugin', 'spell', 'autoload', 'queries'].includes(item.name)) continue

    if (item.type === 'dir') {
      const children = await buildFileTree(item.path)
      if (children.length > 0) {
        nodes.push({ name: item.name, path: item.path, type: 'directory', children })
      }
    } else if (
      item.name.endsWith('.lua') ||
      item.name.endsWith('.json') ||
      item.name === 'README.md' ||
      item.name === 'MIGRATION.md'
    ) {
      nodes.push({ name: item.name, path: item.path, type: 'file' })
    }
  }

  return nodes
}

async function fetchFileContent(filePath: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status}`)
  }
  return res.text()
}

export const Route = createFileRoute('/api/nvim-config')({
  server: {
    handlers: {
      GET: async ({ request }) => {
    const url = new URL(request.url)
    const filePath = url.searchParams.get('file')

    try {
      if (filePath) {
        const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\//, '')

        const cacheKey = `file:${sanitizedPath}`
        const cached = getCached<{ path: string; content: string; highlighted: string; language: string }>(cacheKey)
        if (cached) {
          return Response.json(cached)
        }

        const content = await fetchFileContent(sanitizedPath)
        const ext = sanitizedPath.split('.').pop() || ''
        const language = ext === 'lua' ? 'lua' : ext === 'json' ? 'json' : ext === 'md' ? 'markdown' : 'text'

        let highlighted: string
        try {
          const html = await codeToHtml(content, {
            lang: language,
            theme: shikiConfig.theme,
          })

          const lineCount = content.split('\n').length
          const lineNumbers = Array.from({ length: lineCount }, (_, i) =>
            `<span class="ln">${i + 1}</span>`
          ).join('')

          highlighted = html.replace(
            /<pre([^>]*)><code([^>]*)>/,
            `<pre$1><div class="line-numbers">${lineNumbers}</div><code$2>`
          )
        } catch {
          const escaped = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
          const lines = escaped.split('\n')
          const lineNumbers = lines.map((_, i) => `<span class="ln">${i + 1}</span>`).join('')
          highlighted = `<pre class="shiki"><div class="line-numbers">${lineNumbers}</div><code>${escaped}</code></pre>`
        }

        const result = { path: sanitizedPath, content, highlighted, language }
        setCache(cacheKey, result)
        return Response.json(result)
      }

      const treeCacheKey = 'tree'
      const cachedTree = getCached<FileNode[]>(treeCacheKey)
      if (cachedTree) {
        return Response.json({ tree: cachedTree })
      }

      const tree = await buildFileTree()
      setCache(treeCacheKey, tree)
      return Response.json({ tree })
    } catch (error) {
      console.error('Error fetching nvim config:', error)
      return Response.json({ error: 'Failed to load config from GitHub' }, { status: 500 })
    }
      },
    },
  },
})
