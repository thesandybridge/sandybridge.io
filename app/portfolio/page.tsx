import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';
import { parseGitHubUrl, getRepoStats, type RepoStats } from '@/lib/github';
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
      <h1>Portfolio</h1>
      <p>Projects I&apos;ve built.</p>
      <div className="portfolio-grid">
        {items.map((item) => {
          const stats = statsMap.get(item.slug);
          return (
            <Link key={item.slug} href={`/portfolio/${item.slug}`} className="portfolio-card">
              {item.image && (
                <Image
                  src={`/assets/portfolio/${item.image}`}
                  alt={item.title}
                  width={600}
                  height={338}
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
          );
        })}
      </div>
    </>
  );
}
