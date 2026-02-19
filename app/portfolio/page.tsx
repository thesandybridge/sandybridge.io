import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';
import { parseGitHubUrl, getRepoStats, type RepoStats } from '@/lib/github';
import { CoronaReveal } from '@/components/CoronaReveal';
import { TiltCard } from '@/components/TiltCard';
import { BLUR_DATA_URL } from '@/lib/blur-placeholder';
import { TextScramble } from '@/components/TextScramble';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: "Projects I've built.",
};

export default async function PortfolioPage() {
  const items = getAllPosts('portfolio');

  const statsMap = new Map<string, RepoStats>();
  await Promise.all(
    items.map(async (item) => {
      if (!item.github) return;
      const parsed = parseGitHubUrl(item.github);
      if (!parsed) return;
      const stats = await getRepoStats(parsed.owner, parsed.repo);
      if (stats) statsMap.set(item.slug, stats);
    })
  );

  return (
    <>
      <TextScramble>Portfolio</TextScramble>
      <p>Projects I&apos;ve built.</p>
      <CoronaReveal className="portfolio-masonry">
        {[0, 1].map((col) => (
          <div key={col} className="portfolio-column">
            {items.filter((_, i) => i % 2 === col).map((item) => {
              const stats = statsMap.get(item.slug);
              return (
                <TiltCard key={item.slug}>
                  <Link href={`/portfolio/${item.slug}`} className="portfolio-card">
                    {item.image && (
                      <Image
                        src={`/assets/portfolio/${item.image}`}
                        alt={item.title}
                        width={600}
                        height={338}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    )}
                    <div className="portfolio-card-body">
                      <h3>{item.title}</h3>
                      {item.description && <p>{item.description}</p>}
                      {stats && (
                        <div className="portfolio-stats">
                          {stats.language && <span className="portfolio-stat">{stats.language}</span>}
                          <span className="portfolio-stat">&#9733; {stats.stars}</span>
                          <span className="portfolio-stat">Updated {stats.lastPush}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </TiltCard>
              );
            })}
          </div>
        ))}
      </CoronaReveal>
    </>
  );
}
