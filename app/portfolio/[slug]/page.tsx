import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeShiki from '@shikijs/rehype';
import { shikiConfig } from '@/lib/shiki-config';
import { getPost, getAllPosts } from '@/lib/content';
import { getMDXComponents } from '@/lib/mdx-components';
import { CopyButton, Lightbox } from '@/components/ui';
import { HeadingAnchors, Share } from '@/components/blog';
import { ProjectLinks } from '@/components/features';
import { BLUR_DATA_URL } from '@/lib/blur-placeholder';
import type { Metadata } from 'next';

const getCachedPost = cache((slug: string) => getPost('portfolio', slug));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts('portfolio').map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      ...(post.image && { images: [`/assets/portfolio/${post.image}`] }),
    },
  };
}

export default async function PortfolioItem({ params }: Props) {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) notFound();

  return (
    <>
      <Link href="/portfolio" className="back-link">&larr; Back to Portfolio</Link>
      <article>
        <ProjectLinks github={post.github} url={post.url} blog={post.blog} />
        {post.image && (
          <Image
            src={`/assets/portfolio/${post.image}`}
            alt={post.title}
            width={800}
            height={450}
            className="portfolio-hero"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            style={{ width: '100%', height: 'auto' }}
          />
        )}
        {post.date && <time className="post-date" dateTime={post.date}>{post.date}</time>}
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`} className="tag">{tag}</Link>
            ))}
          </div>
        )}
        <Share title={post.title} />
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
      <CopyButton />
      <HeadingAnchors />
      <Lightbox />
    </>
  );
}
