// Content types
export const CONTENT_TYPES = {
  BLOG: 'blog',
  PORTFOLIO: 'portfolio',
  TIL: 'til',
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// Routes
export const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  PORTFOLIO: '/portfolio',
  TIL: '/til',
  USES: '/uses',
  STATS: '/stats',
  NOW: '/now',
  CHANGELOG: '/changelog',
  COLOPHON: '/colophon',
} as const;

// Build content URL from type and slug
export function getContentUrl(type: ContentType, slug: string): string {
  switch (type) {
    case CONTENT_TYPES.BLOG:
      return `${ROUTES.BLOG}/${slug}`;
    case CONTENT_TYPES.PORTFOLIO:
      return `${ROUTES.PORTFOLIO}/${slug}`;
    case CONTENT_TYPES.TIL:
      return `${ROUTES.TIL}/${slug}`;
    default:
      return `/${slug}`;
  }
}
