// Content types
export const CONTENT_TYPES = {
  BLOG: 'blog',
  PORTFOLIO: 'portfolio',
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// Routes
export const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  PORTFOLIO: '/portfolio',
  USES: '/uses',
  STATS: '/stats',
} as const;

// Build content URL from type and slug
export function getContentUrl(type: ContentType, slug: string): string {
  return type === CONTENT_TYPES.BLOG
    ? `${ROUTES.BLOG}/${slug}`
    : `${ROUTES.PORTFOLIO}/${slug}`;
}
