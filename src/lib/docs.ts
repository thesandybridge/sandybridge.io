import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface Heading {
  id: string;
  title: string;
}

export interface Doc {
  slug: string;
  title: string;
  description?: string;
  order?: number;
  content: string;
  headings: Heading[];
}

const DOCS_DIR = path.join(process.cwd(), 'content/docs');

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

function extractHeadings(content: string): Heading[] {
  const regex = /^## (.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const title = match[1].trim();
    headings.push({ id: slugify(title), title });
  }
  return headings;
}

export async function getAllDocs(): Promise<Doc[]> {
  try {
    const files = await fs.readdir(DOCS_DIR);
    const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

    const docs = await Promise.all(
      mdxFiles.map(async (filename) => {
        const slug = filename.replace(/\.mdx$/, '');
        return getDocBySlug(slug);
      })
    );

    return docs
      .filter((d): d is Doc => d !== null)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  } catch {
    return [];
  }
}

export async function getDocBySlug(slug: string): Promise<Doc | null> {
  try {
    const filePath = path.join(DOCS_DIR, `${slug}.mdx`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || slug,
      description: data.description,
      order: data.order,
      content,
      headings: extractHeadings(content),
    };
  } catch {
    return null;
  }
}

export async function getDocSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(DOCS_DIR);
    return files
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}
