import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getAllPosts } from '@/lib/content';
import { CopyButton } from '@/components/CopyButton';
import { ShareButtons } from '@/components/ShareButtons';
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

  return (
    <>
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
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
      <CopyButton />
    </>
  );
}
