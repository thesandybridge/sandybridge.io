import { NextRequest, NextResponse } from 'next/server';
import { codeToHtml } from 'shiki';
import { shikiConfig } from '@/lib/shiki-config';

export const runtime = 'nodejs';

// GitHub repo for neovim config
const GITHUB_OWNER = 'thesandybridge';
const GITHUB_REPO = 'nvim';
const GITHUB_BRANCH = 'main';

interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

// Cache for file tree and content (5 minute TTL)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchGitHubContents(dirPath: string = ''): Promise<GitHubContent[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dirPath}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'sandybridge.io',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}

async function buildFileTree(dirPath: string = ''): Promise<FileNode[]> {
  const contents = await fetchGitHubContents(dirPath);
  const nodes: FileNode[] = [];

  // Sort: directories first, then files, both alphabetically
  const sorted = contents.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1;
    if (a.type !== 'dir' && b.type === 'dir') return 1;
    return a.name.localeCompare(b.name);
  });

  for (const item of sorted) {
    // Skip hidden files/dirs except specific ones
    if (item.name.startsWith('.') && !item.name.startsWith('.luarc')) continue;
    // Skip certain directories
    if (['plugin', 'spell', 'autoload', 'queries'].includes(item.name)) continue;

    if (item.type === 'dir') {
      const children = await buildFileTree(item.path);
      if (children.length > 0) {
        nodes.push({
          name: item.name,
          path: item.path,
          type: 'directory',
          children,
        });
      }
    } else if (
      item.name.endsWith('.lua') ||
      item.name.endsWith('.json') ||
      item.name === 'README.md' ||
      item.name === 'MIGRATION.md'
    ) {
      nodes.push({
        name: item.name,
        path: item.path,
        type: 'file',
      });
    }
  }

  return nodes;
}

async function fetchFileContent(filePath: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
  const res = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status}`);
  }

  return res.text();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('file');

  try {
    // If file path provided, return file content
    if (filePath) {
      // Sanitize path to prevent any tricks
      const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\//, '');

      // Check cache first
      const cacheKey = `file:${sanitizedPath}`;
      const cached = getCached<{ path: string; content: string; highlighted: string; language: string }>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const content = await fetchFileContent(sanitizedPath);
      const ext = sanitizedPath.split('.').pop() || '';
      const language = ext === 'lua' ? 'lua' : ext === 'json' ? 'json' : ext === 'md' ? 'markdown' : 'text';

      // Generate syntax highlighted HTML with line numbers
      let highlighted: string;
      try {
        const html = await codeToHtml(content, {
          lang: language,
          theme: shikiConfig.theme,
        });

        // Add line numbers by wrapping content
        const lineCount = content.split('\n').length;
        const lineNumbers = Array.from({ length: lineCount }, (_, i) =>
          `<span class="ln">${i + 1}</span>`
        ).join('');

        // Insert line number gutter before the code
        highlighted = html.replace(
          /<pre([^>]*)><code([^>]*)>/,
          `<pre$1><div class="line-numbers">${lineNumbers}</div><code$2>`
        );
      } catch {
        // Fallback to plain text if highlighting fails
        const escaped = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const lines = escaped.split('\n');
        const lineNumbers = lines.map((_, i) => `<span class="ln">${i + 1}</span>`).join('');
        highlighted = `<pre class="shiki"><div class="line-numbers">${lineNumbers}</div><code>${escaped}</code></pre>`;
      }

      const result = {
        path: sanitizedPath,
        content,
        highlighted,
        language,
      };

      setCache(cacheKey, result);
      return NextResponse.json(result);
    }

    // Check cache for tree
    const treeCacheKey = 'tree';
    const cachedTree = getCached<FileNode[]>(treeCacheKey);
    if (cachedTree) {
      return NextResponse.json({ tree: cachedTree });
    }

    // Build and return file tree
    const tree = await buildFileTree();
    setCache(treeCacheKey, tree);

    return NextResponse.json({ tree });
  } catch (error) {
    console.error('Error fetching nvim config:', error);
    return NextResponse.json({ error: 'Failed to load config from GitHub' }, { status: 500 });
  }
}
