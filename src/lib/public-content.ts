import { getAllPosts } from './content';

export function publicSlugs(): string[] {
  return [...new Set(['blog', 'portfolio', 'til'].flatMap(dir =>
    getAllPosts(dir as 'blog' | 'portfolio' | 'til').map(post => post.slug),
  ))];
}
export function isPublicSlug(slug: string): boolean {
  return typeof slug === 'string' && slug.length <= 160 && publicSlugs().includes(slug);
}

export function publicViewKeys(kind: 'views' | 'daily'): string[] {
  const slugs = publicSlugs();
  if (kind === 'views') return slugs.map(slug => `views:${slug}`);
  return Array.from({ length: 90 }, (_, day) => {
    const date = new Date(Date.now() - day * 86400000).toISOString().slice(0, 10);
    return slugs.map(slug => `daily:${slug}:${date}`);
  }).flat();
}
