import { getAllPosts } from './content';

export interface SearchItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  type: 'blog' | 'portfolio';
}

export function generateSearchIndex(): SearchItem[] {
  const blogs = getAllPosts('blog').map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    date: p.date,
    type: 'blog' as const,
  }));

  const portfolio = getAllPosts('portfolio').map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    date: p.date,
    type: 'portfolio' as const,
  }));

  return [...blogs, ...portfolio];
}
