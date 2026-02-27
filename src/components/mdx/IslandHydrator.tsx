import { lazy, Suspense } from 'react'

const ISLANDS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'raft-demo': lazy(() => import('~/components/mdx/RaftDemo').then(m => ({ default: m.RaftDemo }))),
  'drag-tree-demo': lazy(() => import('~/components/mdx/DragTreeDemo').then(m => ({ default: m.DragTreeDemo }))),
  'sha3-demo': lazy(() => import('~/components/mdx/Sha3Demo').then(m => ({ default: m.Sha3Demo }))),
}

const ISLAND_PATTERN = /<div data-island="([^"]+)"><\/div>/

/**
 * Split HTML at data-island markers and render React components inline.
 * No portals needed - just alternating HTML segments and React components.
 */
export function IslandHydrator({ html }: { html: string }) {
  const segments: Array<{ type: 'html'; content: string } | { type: 'island'; id: string }> = []
  let remaining = html

  while (remaining) {
    const match = ISLAND_PATTERN.exec(remaining)
    if (!match) {
      segments.push({ type: 'html', content: remaining })
      break
    }

    // HTML before the island
    if (match.index > 0) {
      segments.push({ type: 'html', content: remaining.slice(0, match.index) })
    }

    // The island component
    const islandId = match[1]
    if (ISLANDS[islandId]) {
      segments.push({ type: 'island', id: islandId })
    }

    remaining = remaining.slice(match.index + match[0].length)
  }

  // Segments contain pre-rendered HTML from our rehype pipeline (not user input)
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'html') {
          return <div key={i} dangerouslySetInnerHTML={{ __html: seg.content }} />
        }
        const Component = ISLANDS[seg.id]
        return (
          <Suspense key={i} fallback={<div style={{ padding: '1rem', opacity: 0.5 }}>Loading {seg.id}...</div>}>
            <Component />
          </Suspense>
        )
      })}
    </>
  )
}
