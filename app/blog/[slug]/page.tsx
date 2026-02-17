import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeShiki from '@shikijs/rehype';
import { getPost, getAllPosts, getAdjacentPosts, extractHeadings } from '@/lib/content';
import { getMDXComponents } from '@/lib/mdx-components';
import { CopyButton } from '@/components/CopyButton';
import { ShareButtons } from '@/components/ShareButtons';
import { ReadingProgress } from '@/components/ReadingProgress';
import { TableOfContents } from '@/components/TableOfContents';
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

  return (
    <>
      <ReadingProgress />
      <Link href="/blog" className="back-link">&larr; Back to Blog</Link>
      <article>
        {post.date && <time className="post-date" dateTime={post.date}>{post.date}</time>}
        {post.readTime > 0 && <span className="read-time">{post.readTime} min read</span>}
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`} className="tag">{tag}</Link>
            ))}
          </div>
        )}
        <ShareButtons title={post.title} />
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
                [rehypeShiki, { theme: 'gruvbox-dark-medium' }],
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
      <CopyButton />
    </>
  );
}
