import type { MetadataRoute } from 'next';
import { getAllPosts, getAllTags } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sandybridge.io';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/portfolio`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/til`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/now`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/changelog`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${baseUrl}/colophon`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const blogPosts: MetadataRoute.Sitemap = getAllPosts('blog').map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const tags: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `${baseUrl}/blog/tag/${tag}`,
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  const portfolioItems: MetadataRoute.Sitemap = getAllPosts('portfolio').map((item) => ({
    url: `${baseUrl}/portfolio/${item.slug}`,
    lastModified: item.date,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const tilPosts: MetadataRoute.Sitemap = getAllPosts('til').map((post) => ({
    url: `${baseUrl}/til/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...blogPosts, ...tags, ...portfolioItems, ...tilPosts];
}
