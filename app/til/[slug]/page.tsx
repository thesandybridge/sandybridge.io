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
      <Link href="/til" className="back-link">&larr; Back to TIL</Link>
      <article className="til-article">
        <h1>{post.title}</h1>
        {post.date && <time className="post-date" dateTime={post.date}>{post.date}</time>}
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
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
        <nav className="post-nav" aria-label="Post navigation">
          {prev ? (
            <Link href={`/til/${prev.slug}`} className="post-nav-link post-nav-prev">
              <span className="post-nav-label">&larr; Previous</span>
              <span className="post-nav-title">{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/til/${next.slug}`} className="post-nav-link post-nav-next">
              <span className="post-nav-label">Next &rarr;</span>
              <span className="post-nav-title">{next.title}</span>
            </Link>
          ) : <span />}
        </nav>
      )}
      <CopyButton />
      <Lightbox />
    </>
  );
}
