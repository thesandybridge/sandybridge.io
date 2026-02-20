import { cache } from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeShiki from '@shikijs/rehype';
import { shikiConfig } from '@/lib/shiki-config';
import { getDocBySlug, getDocSlugs } from '@/lib/docs';
import { getMDXComponents } from '@/lib/mdx-components';
import { CopyButton } from '@/components/ui';
import type { Metadata } from 'next';

const getCachedDoc = cache((slug: string) => getDocBySlug(slug));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getCachedDoc(slug);
  if (!doc) return {};

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getCachedDoc(slug);
  if (!doc) notFound();

  return (
    <>
      <article>
        <h1>{doc.title}</h1>
        {doc.description && <p className="docs-subtitle">{doc.description}</p>}
        <MDXRemote
          source={doc.content}
          components={getMDXComponents()}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeRaw,
                rehypeSlug,
                [rehypeShiki, shikiConfig],
              ],
            },
          }}
        />
      </article>
      <CopyButton />
    </>
  );
}
