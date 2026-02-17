import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeShiki from '@shikijs/rehype';
import { shikiConfig } from '@/lib/shiki-config';
import { getPost, getAllPosts, getAdjacentPosts, extractHeadings, getRelatedPosts, getSeriesPosts } from '@/lib/content';
import { getMDXComponents } from '@/lib/mdx-components';
import { CopyButton } from '@/components/CopyButton';
import { HeadingAnchors } from '@/components/HeadingAnchors';
import { Lightbox } from '@/components/Lightbox';
import { ShareButtons } from '@/components/ShareButtons';
import { ReadingProgress } from '@/components/ReadingProgress';
import { TableOfContents } from '@/components/TableOfContents';
import { SeriesNav } from '@/components/SeriesNav';
import { Giscus } from '@/components/Giscus';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts('blog').map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost('blog', slug);
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
  const post = await getPost('blog', slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts('blog', slug);
  const headings = extractHeadings(post.rawContent);
  const relatedPosts = getRelatedPosts(slug, post.tags);
  const seriesPosts = post.series ? getSeriesPosts(post.series) : [];
  const showUpdated = post.lastModified && post.lastModified !== post.date;

  return (
    <>
      <ReadingProgress />
      <Link href="/blog" className="back-link">&larr; Back to Blog</Link>
      <article>
        {post.date && <time className="post-date" dateTime={post.date}>{post.date}</time>}
        {showUpdated && <time className="post-updated" dateTime={post.lastModified}>Updated {post.lastModified}</time>}
        {post.readTime > 0 && <span className="read-time">{post.readTime} min read</span>}
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`} className="tag">{tag}</Link>
            ))}
          </div>
        )}
        <ShareButtons title={post.title} />
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
        <nav className="post-nav" aria-label="Post navigation">
          {prev ? (
            <Link href={`/blog/${prev.slug}`} className="post-nav-link post-nav-prev">
              <span className="post-nav-label">&larr; Previous</span>
              <span className="post-nav-title">{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="post-nav-link post-nav-next">
              <span className="post-nav-label">Next &rarr;</span>
              <span className="post-nav-title">{next.title}</span>
            </Link>
          ) : <span />}
        </nav>
      )}
      <Giscus />
      {relatedPosts.length > 0 && (
        <nav className="related-posts" aria-label="Related posts">
          <h3>Related Posts</h3>
          <ul>
            {relatedPosts.map((rp) => (
              <li key={rp.slug}>
                <Link href={`/blog/${rp.slug}`}>
                  <span className="related-title">{rp.title}</span>
                  <time>{rp.date}</time>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <CopyButton />
      <HeadingAnchors />
      <Lightbox />
    </>
  );
}
