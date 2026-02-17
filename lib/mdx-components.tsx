import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { Callout } from '@/components/mdx/Callout';
import { CodeTabs } from '@/components/mdx/CodeTabs';

export function getMDXComponents(): MDXComponents {
  return {
    Callout,
    CodeTabs,
    a: ({ href, children, ...props }) => {
      if (href?.startsWith('/')) {
        return <Link href={href} {...props}>{children}</Link>;
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },
  };
}
