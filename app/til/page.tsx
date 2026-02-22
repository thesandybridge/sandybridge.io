import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { CoronaReveal } from '@/components/effects';
import { TextScramble } from '@/components/home';
import s from './til.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIL',
  description: 'Today I Learned - Quick tips, tricks, and discoveries.',
};

export default function TILPage() {
  const posts = getAllPosts('til');

  return (
    <>
      <TextScramble>Today I Learned</TextScramble>
      <p>Short posts about things I learn day to day. Quick tips, tricks, commands, and discoveries worth remembering.</p>
      <nav>
        <ul className={s.list}>
          {posts.map((post, i) => (
            <CoronaReveal as="li" key={post.slug} delay={Math.min(i * 40, 400)}>
              <Link href={`/til/${post.slug}`}>
                <h3>{post.title}</h3>
                <div className={s.meta}>
                  {post.date && <time dateTime={post.date}>{post.date}</time>}
                  {post.tags.length > 0 && (
                    <span className={s.tags}>
                      {post.tags.map((tag) => (
                        <span key={tag} className={s.tag}>{tag}</span>
                      ))}
                    </span>
                  )}
                </div>
              </Link>
            </CoronaReveal>
          ))}
        </ul>
      </nav>
      {posts.length === 0 && (
        <p className={s.emptyState}>No TIL posts yet. Check back soon!</p>
      )}
    </>
  );
}
