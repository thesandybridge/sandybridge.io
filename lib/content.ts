import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { createHighlighter, type Highlighter } from 'shiki';

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
}

export interface Post extends PostMeta {
  content: string;
}

const contentDir = path.join(process.cwd(), 'content');

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['gruvbox-dark-medium'],
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

function getDir(dir: 'blog' | 'portfolio'): string {
  return dir === 'blog'
    ? contentDir
    : path.join(contentDir, 'portfolio');
}

function parseFrontmatter(filePath: string): PostMeta | null {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  if (!data.title) return null;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const slug = path.basename(filePath, '.md');

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
  };
}

export function getAllPosts(dir: 'blog' | 'portfolio', limit?: number): PostMeta[] {
  const dirPath = getDir(dir);
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));
  const posts: PostMeta[] = [];

  for (const file of files) {
    const meta = parseFrontmatter(path.join(dirPath, file));
    if (meta) posts.push(meta);
  }

  posts.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

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
          theme: 'gruvbox-dark-medium',
        });
      } catch {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    }
  );

  return html;
}

export async function getPost(dir: 'blog' | 'portfolio', slug: string): Promise<Post | null> {
  const filePath = path.join(getDir(dir), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const html = await renderMarkdown(content);

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
    content: html,
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
