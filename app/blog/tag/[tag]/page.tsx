import Link from 'next/link';
import { getPostsByTag, getAllTags } from '@/lib/content';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Posts tagged "${tag}"`,
    description: `Blog posts tagged with ${tag}.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  return (
    <>
      <h1>Posts tagged &ldquo;{tag}&rdquo;</h1>
      <nav>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                <h3>{post.title}</h3>
                {post.date && <time dateTime={post.date}>{post.date}</time>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p><Link href="/blog">&larr; All posts</Link></p>
    </>
  );
}
