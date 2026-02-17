import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getAllPosts } from '@/lib/content';
import { CopyButton } from '@/components/CopyButton';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts('portfolio').map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost('portfolio', slug);
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
  const post = await getPost('portfolio', slug);
  if (!post) notFound();

  return (
    <>
      <Link href="/portfolio" className="back-link">&larr; Back to Portfolio</Link>
      <article>
        <div className="project-links">
          {post.github && (
            <a href={post.github} target="_blank" rel="noopener">
              <img src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/github-light.svg" alt="GitHub" className="project-icon" />
            </a>
          )}
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener">
              <img src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/web-check.svg" alt="Live Site" className="project-icon" />
            </a>
          )}
          {post.blog && (
            <Link href={post.blog}>
              <img src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/blogger.svg" alt="Blog Post" className="project-icon" />
            </Link>
          )}
        </div>
        {post.image && (
          <img src={`/assets/portfolio/${post.image}`} alt={post.title} className="portfolio-hero" loading="lazy" />
        )}
        {post.date && <time className="post-date" dateTime={post.date}>{post.date}</time>}
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`} className="tag">{tag}</Link>
            ))}
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
      <CopyButton />
    </>
  );
}
