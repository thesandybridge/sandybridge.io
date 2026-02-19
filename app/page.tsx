import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';
import { CoronaReveal } from '@/components/CoronaReveal';
import { BootSequence } from '@/components/BootSequence';
import { TiltCard } from '@/components/TiltCard';
import { BLUR_DATA_URL } from '@/lib/blur-placeholder';
import { HeroText } from '@/components/HeroText';
import { InteractiveAscii } from '@/components/InteractiveAscii';
import { Typewriter } from '@/components/Typewriter';

export default function Home() {
  const posts = getAllPosts('blog');
  const portfolioItems = getAllPosts('portfolio');
  const recentPosts = posts.slice(0, 3);
  const recentPortfolio = portfolioItems.slice(0, 3);

  return (
    <>
      <BootSequence postCount={posts.length} projectCount={portfolioItems.length} />
      <InteractiveAscii />
      <HeroText />
      <Typewriter lines={[
        "I'm a software engineer focused on frontend development and expanding into systems work. I started building WordPress sites, then moved into modern web applications with React and TypeScript. These days I'm learning Rust and working on CLI tools, debugging infrastructure, and understanding the systems that power the web. I deliver working software that solves actual problems.",
        "Currently working for a SaaS startup, where I've become the goto for frontend architecture and increasingly for backend and infrastructure work. I've optimized CI/CD pipelines, debugged production microservices, and built tooling that actually saves time and money. I am self taught with no degree, just consistent focus on understanding how things work and making them work better.",
      ]} />

      {recentPosts.length > 0 && (
        <CoronaReveal>
          <h2>Recent Posts</h2>
          <nav>
            <ul>
              {recentPosts.map((post, i) => (
                <CoronaReveal as="li" key={post.slug} delay={i * 100}>
                  <Link href={`/blog/${post.slug}`}>
                    <h3>{post.title}</h3>
                    {post.date && <time dateTime={post.date}>{post.date}</time>}
                  </Link>
                </CoronaReveal>
              ))}
            </ul>
          </nav>
          <p style={{ marginTop: '1rem' }}><Link href="/blog">View all posts</Link></p>
        </CoronaReveal>
      )}

      {recentPortfolio.length > 0 && (
        <CoronaReveal>
          <h2>Projects</h2>
          <div className="portfolio-grid">
            {recentPortfolio.map((item) => (
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
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
          <p style={{ marginTop: '1rem' }}><Link href="/portfolio">View all projects</Link></p>
        </CoronaReveal>
      )}
    </>
  );
}
