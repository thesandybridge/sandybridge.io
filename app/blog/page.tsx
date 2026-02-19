import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { PostViewCounts } from '@/components/PostViewCounts';
import { TrendingPosts } from '@/components/TrendingPosts';
import { CoronaReveal } from '@/components/CoronaReveal';
import { TextScramble } from '@/components/TextScramble';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Blog posts, guides, and notes.',
};

export default function BlogPage() {
  const posts = getAllPosts('blog');

  return (
    <>
      <TextScramble>Blog, Guides, Notes</TextScramble>
      <p>This is collection of blog posts on whatever I feel like writing about, as well as some guides I wrote. I also keep some notes here for personal use that I have marked public.</p>
      <TrendingPosts posts={posts.map((p) => ({ slug: p.slug, title: p.title }))} />
      <nav>
        <ul>
          {posts.map((post, i) => (
            <CoronaReveal as="li" key={post.slug} delay={Math.min(i * 60, 600)}>
              <Link href={`/blog/${post.slug}`}>
                <h3 style={{ viewTransitionName: `post-${post.slug}` }}>{post.title}</h3>
                {post.date && <time dateTime={post.date}>{post.date}</time>}
              </Link>
            </CoronaReveal>
          ))}
        </ul>
      </nav>
      <PostViewCounts />
    </>
  );
}
