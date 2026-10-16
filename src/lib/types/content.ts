export interface PostMeta {
  title: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
  github?: string;
  url?: string;
  blog?: string;
  npm?: string;
  slug: string;
  readTime: number;
  lastModified?: string;
  series?: string;
  seriesOrder?: number;
  category?: string;
  featured?: boolean;
  work?: boolean;
}

export interface Post extends PostMeta {
  content: string;
  rawContent: string;
}

export type ContentDir = 'blog' | 'portfolio' | 'til';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

