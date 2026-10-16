export interface SearchItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  type: 'blog' | 'portfolio' | 'til';
}

