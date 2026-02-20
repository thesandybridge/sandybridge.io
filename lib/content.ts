import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { createHighlighter, createCssVariablesTheme, type Highlighter } from 'shiki';

const cssVariablesTheme = createCssVariablesTheme({
  name: 'css-variables',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true,
});

export interface PostMeta {
  title: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
  github?: string;
  url?: string;
  blog?: string;
  slug: string;
  readTime: number;
  lastModified?: string;
  series?: string;
  seriesOrder?: number;
}

export interface Post extends PostMeta {
  content: string;
  rawContent: string;
}

const contentDir = path.join(process.cwd(), 'content');

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [cssVariablesTheme],
      langs: [
        'javascript', 'typescript', 'bash', 'json', 'html', 'css',
        'go', 'rust', 'python', 'yaml', 'toml', 'markdown', 'sql',
        'tsx', 'jsx', 'diff', 'lua', 'c', 'cpp', 'java', 'php',
        'xml', 'shell', 'dockerfile', 'makefile',
      ],
    });
  }
  return highlighterPromise;
}

function getLastModified(filePath: string): string | undefined {
  try {
    const result = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    }).trim();
    if (!result) return undefined;
    return result.split('T')[0];
  } catch {
    return undefined;
  }
}

export type ContentDir = 'blog' | 'portfolio' | 'til';

function getDir(dir: ContentDir): string {
  if (dir === 'blog') return contentDir;
  return path.join(contentDir, dir);
}

function getExtension(filePath: string): string {
  if (filePath.endsWith('.mdx')) return '.mdx';
  return '.md';
}

function parseFrontmatter(filePath: string): PostMeta | null {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  if (!data.title) return null;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const ext = getExtension(filePath);
  const slug = path.basename(filePath, ext);

  const lastModified = getLastModified(filePath);

  return {
    title: data.title,
    date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date ? String(data.date).split('T')[0] : ''),
    description: data.description || '',
    tags: data.tags || [],
    image: data.image,
    github: data.github,
    url: data.url,
    blog: data.blog,
    slug,
    readTime,
    lastModified,
    series: data.series,
    seriesOrder: data.seriesOrder,
  };
}

const postsCache = new Map<string, PostMeta[]>();

export function getAllPosts(dir: ContentDir, limit?: number): PostMeta[] {
  let posts = postsCache.get(dir);
  if (!posts) {
    const dirPath = getDir(dir);
    if (!fs.existsSync(dirPath)) return [];

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
    posts = [];

    for (const file of files) {
      const meta = parseFrontmatter(path.join(dirPath, file));
      if (meta) posts.push(meta);
    }

    posts.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
    postsCache.set(dir, posts);
  }

  if (limit) return posts.slice(0, limit);
  return posts;
}

async function renderMarkdown(raw: string): Promise<string> {
  const shiki = await getHighlighter();

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(raw);

  let html = String(result);

  // Apply syntax highlighting to code blocks
  html = html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_, lang, code) => {
      const decoded = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      try {
        return shiki.codeToHtml(decoded, {
          lang,
          theme: 'css-variables',
        });
      } catch {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    }
  );

  return html;
}

function resolveFile(dir: string, slug: string): string | null {
  for (const ext of ['.mdx', '.md']) {
    const filePath = path.join(dir, `${slug}${ext}`);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

export async function getPost(dir: ContentDir, slug: string): Promise<Post | null> {
  const filePath = resolveFile(getDir(dir), slug);
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const html = await renderMarkdown(content);
  const lastModified = getLastModified(filePath);

  return {
    title: data.title || slug,
    date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date ? String(data.date).split('T')[0] : ''),
    description: data.description || '',
    tags: data.tags || [],
    image: data.image,
    github: data.github,
    url: data.url,
    blog: data.blog,
    slug,
    readTime,
    lastModified,
    series: data.series,
    seriesOrder: data.seriesOrder,
    content: html,
    rawContent: content,
  };
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts('blog').filter((p) =>
    p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const posts = getAllPosts('blog');
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags);
}

export function getAdjacentPosts(dir: ContentDir, slug: string): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getAllPosts(dir);
  const idx = posts.findIndex((p) => p.slug === slug);
  return {
    prev: idx < posts.length - 1 ? posts[idx + 1] : null,
    next: idx > 0 ? posts[idx - 1] : null,
  };
}

export function getRelatedPosts(slug: string, tags: string[], limit = 3): PostMeta[] {
  const allPosts = getAllPosts('blog').filter((p) => p.slug !== slug);
  const scored = allPosts.map((post) => {
    const overlap = post.tags.filter((t) => tags.includes(t)).length;
    return { post, score: overlap };
  });
  scored.sort((a, b) => b.score - a.score || (b.post.date > a.post.date ? 1 : -1));
  return scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.post);
}

export function getSeriesPosts(seriesName: string): PostMeta[] {
  return getAllPosts('blog')
    .filter((p) => p.series === seriesName)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(source: string): Heading[] {
  // Works on both raw markdown and HTML
  // Try markdown heading syntax first
  const mdRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = mdRegex.exec(source)) !== null) {
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
    headings.push({ level: match[1].length, id, text });
  }
  if (headings.length > 0) return headings;

  // Fallback: HTML heading tags
  const htmlRegex = /<h([2-4])\s+id="([^"]+)"[^>]*>(.*?)<\/h[2-4]>/g;
  while ((match = htmlRegex.exec(source)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ''),
    });
  }
  return headings;
}
