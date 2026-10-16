import type { SearchItem } from '../types/search';
export type { SearchItem } from '../types/search';
import { getAllPosts } from './content';

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

  const til = getAllPosts('til').map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    date: p.date,
    type: 'til' as const,
  }));

  return [...blogs, ...portfolio, ...til];
}
