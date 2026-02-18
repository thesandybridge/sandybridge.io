import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';
import { CoronaReveal } from '@/components/CoronaReveal';
import { BootSequence } from '@/components/BootSequence';

export default function Home() {
  const posts = getAllPosts('blog');
  const portfolioItems = getAllPosts('portfolio');
  const recentPosts = posts.slice(0, 3);
  const recentPortfolio = portfolioItems.slice(0, 3);

  return (
    <>
      <BootSequence postCount={posts.length} projectCount={portfolioItems.length} />
      <pre className="ascii" aria-hidden="true">
{`███████╗ █████╗ ███╗   ██╗██████╗ ██╗   ██╗██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗
██╔════╝██╔══██╗████╗  ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝
███████╗███████║██╔██╗ ██║██║  ██║ ╚████╔╝ ██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗
╚════██║██╔══██║██║╚██╗██║██║  ██║  ╚██╔╝  ██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝
███████║██║  ██║██║ ╚████║██████╔╝   ██║   ██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗
╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝    ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝ ╚══════╝`}
      </pre>
      <h1>Hey, I&apos;m Matt.</h1>
      <p>I&apos;m a software engineer focused on frontend development and expanding into systems work. I started building WordPress sites, then moved into modern web applications with React and TypeScript. These days I&apos;m learning Rust and working on CLI tools, debugging infrastructure, and understanding the systems that power the web. I deliver working software that solves actual problems.</p>
      <p>Currently working for a SaaS startup, where I&apos;ve become the goto for frontend architecture and increasingly for backend and infrastructure work. I&apos;ve optimized CI/CD pipelines, debugged production microservices, and built tooling that actually saves time and money. I am self taught with no degree, just consistent focus on understanding how things work and making them work better.</p>

      {recentPosts.length > 0 && (
        <CoronaReveal>
          <h2>Recent Posts</h2>
          <nav>
            <ul>
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`}>
                    <h3>{post.title}</h3>
                    {post.date && <time dateTime={post.date}>{post.date}</time>}
                  </Link>
                </li>
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
          <p style={{ marginTop: '1rem' }}><Link href="/portfolio">View all projects</Link></p>
        </CoronaReveal>
      )}
    </>
  );
}
