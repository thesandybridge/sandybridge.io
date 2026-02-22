import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeShiki from '@shikijs/rehype';
import { shikiConfig } from '@/lib/shiki-config';
import { getPost, getAllPosts, getAdjacentPosts } from '@/lib/content';
import { getMDXComponents } from '@/lib/mdx-components';
import { CopyButton, Lightbox } from '@/components/ui';
import pm from '@/components/blog/post-meta.module.css';
import tags from '@/components/blog/tags.module.css';
import nav from '@/components/blog/post-nav.module.css';
import til from '../til.module.css';
import { cx } from '@/lib/cx';
import type { Metadata } from 'next';

const getCachedPost = cache((slug: string) => getPost('til', slug));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts('til').map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) return {};

  return {
    title: `TIL: ${post.title}`,
    description: post.description,
    openGraph: {
      type: 'article',
      title: `TIL: ${post.title}`,
      description: post.description,
    },
  };
}

export default async function TILPost({ params }: Props) {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts('til', slug);

  return (
    <>
      <Link href="/til" className={pm.backLink}>&larr; Back to TIL</Link>
      <article className={til.article}>
        <h1>{post.title}</h1>
        {post.date && <time className={pm.postDate} dateTime={post.date}>{post.date}</time>}
        {post.tags.length > 0 && (
          <div className={tags.postTags}>
            {post.tags.map((tag) => (
              <span key={tag} className={tags.tag}>{tag}</span>
            ))}
          </div>
        )}
        <MDXRemote
          source={post.rawContent}
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
      {(prev || next) && (
        <nav className={nav.postNav} aria-label="Post navigation" data-nav>
          {prev ? (
            <Link href={`/til/${prev.slug}`} className={nav.postNavLink}>
              <span className={nav.postNavLabel}>&larr; Previous</span>
              <span className={nav.postNavTitle}>{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/til/${next.slug}`} className={cx(nav.postNavLink, nav.postNavNext)}>
              <span className={nav.postNavLabel}>Next &rarr;</span>
              <span className={nav.postNavTitle}>{next.title}</span>
            </Link>
          ) : <span />}
        </nav>
      )}
      <CopyButton />
      <Lightbox />
    </>
  );
}
