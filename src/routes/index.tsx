import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/content'
import { CoronaReveal, TiltCard } from '~/components/effects'
import { BLUR_DATA_URL } from '~/lib/blur-placeholder'
import { BootSequence, HeroText, InteractiveAscii, Typewriter, TechStack, AsciiInfo } from '~/components/home'
import { StatusIndicator } from '~/components/ui'
import p from '~/components/features/PortfolioGrid.module.css'

const fetchHomepage = createServerFn({ method: 'GET' }).handler(async () => {
  const posts = getAllPosts('blog')
  const portfolioItems = getAllPosts('portfolio')
  return {
    postCount: posts.length,
    projectCount: portfolioItems.length,
    recentPosts: posts.slice(0, 3),
    recentPortfolio: portfolioItems.slice(0, 3),
  }
})

export const Route = createFileRoute('/')({
  loader: () => fetchHomepage(),
  component: Home,
})

function Home() {
  const { postCount, projectCount, recentPosts, recentPortfolio } = Route.useLoaderData()

  return (
    <>
      <BootSequence postCount={postCount} projectCount={projectCount} clientIP="visitor" />
      <InteractiveAscii />
      <AsciiInfo />
      <StatusIndicator />
      <HeroText />
      <Typewriter lines={[
        "I'm a software engineer focused on frontend development and expanding into systems work. I started building WordPress sites, then moved into modern web applications with React and TypeScript. These days I'm learning Rust and working on CLI tools, debugging infrastructure, and understanding the systems that power the web. I deliver working software that solves actual problems.",
        "Currently working for a SaaS startup, where I've become the goto for frontend architecture and increasingly for backend and infrastructure work. I've optimized CI/CD pipelines, debugged production microservices, and built tooling that actually saves time and money. I am self taught with no degree, just consistent focus on understanding how things work and making them work better.",
      ]} />

      <CoronaReveal>
        <TechStack />
      </CoronaReveal>

      {recentPosts.length > 0 && (
        <CoronaReveal>
          <h2>Recent Posts</h2>
          <nav>
            <ul>
              {recentPosts.map((post, i) => (
                <CoronaReveal as="li" key={post.slug} delay={i * 100}>
                  <Link to="/blog/$slug" params={{ slug: post.slug }}>
                    <h3>{post.title}</h3>
                    {post.date && <time dateTime={post.date}>{post.date}</time>}
                  </Link>
                </CoronaReveal>
              ))}
            </ul>
          </nav>
          <p style={{ marginTop: '1rem' }}><Link to="/blog">View all posts</Link></p>
        </CoronaReveal>
      )}

      {recentPortfolio.length > 0 && (
        <CoronaReveal>
          <h2>Projects</h2>
          <div className={p.portfolioGrid}>
            {recentPortfolio.map((item) => (
              <TiltCard key={item.slug}>
                <Link to="/portfolio/$slug" params={{ slug: item.slug }} className={p.portfolioCard}>
                  {item.image && (
                    <img
                      src={`/assets/portfolio/${item.image}`}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: 'auto', backgroundImage: `url(${BLUR_DATA_URL})`, backgroundSize: 'cover' }}
                    />
                  )}
                  <div className={p.portfolioCardBody}>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
          <p style={{ marginTop: '1rem' }}><Link to="/portfolio">View all projects</Link></p>
        </CoronaReveal>
      )}
    </>
  )
}
