import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/server/content'
import { CoronaReveal, TiltCard } from '~/components/effects'
import { BLUR_DATA_URL } from '~/lib/blur-placeholder'
import { BootSequence, HeroText, InteractiveAscii, TechStack, AsciiInfo } from '~/components/home'
import { StatusIndicator } from '~/components/ui'
import s from '~/styles/home.module.css'
import { openContact } from '~/lib/contact'
import p from '~/components/features/PortfolioGrid.module.css'

const fetchHomepage = createServerFn({ method: 'GET' }).handler(async () => {
  const posts = getAllPosts('blog')
  const portfolioItems = getAllPosts('portfolio')
  return {
    postCount: posts.length,
    projectCount: portfolioItems.length,
    recentPosts: posts.slice(0, 3),
    recentPortfolio: [...portfolioItems.filter(item => item.featured), ...portfolioItems.filter(item => !item.featured)].slice(0, 3),
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
      <p className={s.intro}>I'm a software engineer building web applications, developer tools, and a deeper understanding of the systems behind them.</p>
      <div className={s.actions}>
        <Link to="/portfolio" className={s.primary}>View my work <span aria-hidden="true">→</span></Link>
        <button onClick={openContact}>Get in touch</button>
      </div>

      {recentPortfolio.length > 0 && (
        <CoronaReveal>
          <h2>Selected work</h2>
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
      <section className={s.about}>
        <h2>A little about me</h2>
        <p>I'm self-taught, starting with WordPress and moving into React and TypeScript. At a SaaS startup, I work on frontend architecture, backend services, and infrastructure. Outside of work, I'm learning Rust and building CLI tools.</p>
        <TechStack />
      </section>

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

    </>
  )
}
