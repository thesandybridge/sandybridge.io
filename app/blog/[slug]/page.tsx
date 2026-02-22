import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeShiki from '@shikijs/rehype';
import { shikiConfig } from '@/lib/shiki-config';
import { getPost, getAllPosts, getAdjacentPosts, extractHeadings, getRelatedPosts, getSeriesPosts } from '@/lib/content';
import { getMDXComponents } from '@/lib/mdx-components';
import { CopyButton, Lightbox } from '@/components/ui';
import { HeadingAnchors, Share, ReadingProgress, TableOfContents, SeriesNav, Giscus, ViewCounter, ResumeReading } from '@/components/blog';
import pm from '@/components/blog/post-meta.module.css';
import tags from '@/components/blog/tags.module.css';
import nav from '@/components/blog/post-nav.module.css';
import { cx } from '@/lib/cx';
import bp from './page.module.css';
import type { Metadata } from 'next';

function generateArticleJsonLd(post: { title: string; description: string; date: string; lastModified?: string; slug: string; tags: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    author: {
      '@type': 'Person',
      name: 'Matt Miller',
      url: 'https://sandybridge.io',
    },
    publisher: {
      '@type': 'Person',
      name: 'Matt Miller',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sandybridge.io/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
}

const getCachedPost = cache((slug: string) => getPost('blog', slug));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts('blog').map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts('blog', slug);
  const headings = extractHeadings(post.rawContent);
  const relatedPosts = getRelatedPosts(slug, post.tags);
  const seriesPosts = post.series ? getSeriesPosts(post.series) : [];
  const showUpdated = post.lastModified && post.lastModified !== post.date;

  const jsonLd = generateArticleJsonLd(post);

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <ResumeReading slug={slug} />
      <Link href="/blog" className={pm.backLink}>&larr; Back to Blog</Link>
      <article>
        <h1 style={{ viewTransitionName: `post-${slug}` }}>{post.title}</h1>
        {post.date && <time className={pm.postDate} dateTime={post.date}>{post.date}</time>}
        {showUpdated && <time className="post-updated" dateTime={post.lastModified}>Updated {post.lastModified}</time>}
        <div className={pm.postMetaLine}>
          {post.readTime > 0 && <span className={pm.readTime}>{post.readTime} min read</span>}
          <ViewCounter slug={slug} />
        </div>
        {post.tags.length > 0 && (
          <div className={tags.postTags}>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`} className={tags.tag}>{tag}</Link>
            ))}
          </div>
        )}
        <Share title={post.title} />
        {seriesPosts.length > 1 && (
          <SeriesNav currentSlug={slug} seriesPosts={seriesPosts} seriesName={post.series!} />
        )}
        {headings.length > 2 && <TableOfContents headings={headings} />}
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
            <Link href={`/blog/${prev.slug}`} className={nav.postNavLink}>
              <span className={nav.postNavLabel}>&larr; Previous</span>
              <span className={nav.postNavTitle}>{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/blog/${next.slug}`} className={cx(nav.postNavLink, nav.postNavNext)}>
              <span className={nav.postNavLabel}>Next &rarr;</span>
              <span className={nav.postNavTitle}>{next.title}</span>
            </Link>
          ) : <span />}
        </nav>
      )}
      <Giscus />
      {relatedPosts.length > 0 && (
        <nav className={bp.relatedPosts} aria-label="Related posts" data-nav>
          <h3>Related Posts</h3>
          <ul>
            {relatedPosts.map((rp) => (
              <li key={rp.slug}>
                <Link href={`/blog/${rp.slug}`}>
                  <span className={bp.relatedTitle}>{rp.title}</span>
                  <time>{rp.date}</time>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <a href="#content" className={bp.backToTop} aria-label="Back to top">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 12V4M4 7l4-4 4 4" />
        </svg>
      </a>
      <CopyButton />
      <HeadingAnchors />
      <Lightbox />
    </>
  );
}
