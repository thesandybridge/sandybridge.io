import { transformerMetaHighlight } from '@shikijs/transformers';

export const shikiConfig = {
  theme: 'gruvbox-dark-medium' as const,
  transformers: [transformerMetaHighlight()],
};
