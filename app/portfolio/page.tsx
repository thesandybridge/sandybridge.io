import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: "Projects I've built.",
};

export default function PortfolioPage() {
  const items = getAllPosts('portfolio');

  return (
    <>
      <h1>Portfolio</h1>
      <p>Projects I&apos;ve built.</p>
      <div className="portfolio-grid">
        {items.map((item) => (
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
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
