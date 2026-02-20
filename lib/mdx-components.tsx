import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { Callout } from '@/components/mdx/Callout';
import { CodeTabs } from '@/components/mdx/CodeTabs';
import { DragTreeDemo } from '@/components/mdx/DragTreeDemo';
import { PlaceholderImage } from '@/components/mdx/PlaceholderImage';

export function getMDXComponents(): MDXComponents {
  return {
    Callout,
    CodeTabs,
    DragTreeDemo,
    a: ({ href, children, ...props }) => {
      if (href?.startsWith('/')) {
        return <Link href={href} {...props}>{children}</Link>;
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },
    img: ({ src, alt, className }) => (
      <PlaceholderImage src={src} alt={alt} className={className} />
    ),
  };
}
