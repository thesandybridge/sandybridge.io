import { getAllPosts } from '@/lib/content';
import { parseGitHubUrl, getRepoStats, type RepoStats } from '@/lib/github';
import { PortfolioGrid } from '@/components/features';
import { TextScramble } from '@/components/home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: "Projects I've built.",
};

export default async function PortfolioPage() {
  const items = getAllPosts('portfolio');

  const statsMap: Record<string, RepoStats> = {};
  await Promise.all(
    items.map(async (item) => {
      if (!item.github) return;
      const parsed = parseGitHubUrl(item.github);
      if (!parsed) return;
      const stats = await getRepoStats(parsed.owner, parsed.repo);
      if (stats) statsMap[item.slug] = stats;
    })
  );

  return (
    <>
      <TextScramble>Portfolio</TextScramble>
      <p>Projects I&apos;ve built.</p>
      <PortfolioGrid items={items} statsMap={statsMap} />
    </>
  );
}
