import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'

const ISLANDS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'raft-demo': lazy(() => import('~/components/mdx/RaftDemo').then(m => ({ default: m.RaftDemo }))),
  'drag-tree-demo': lazy(() => import('~/components/mdx/DragTreeDemo').then(m => ({ default: m.DragTreeDemo }))),
  'sha3-demo': lazy(() => import('~/components/mdx/Sha3Demo').then(m => ({ default: m.Sha3Demo }))),
}

export function IslandHydrator({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [islands, setIslands] = useState<{ id: string; element: HTMLElement }[]>([])

  useEffect(() => {
    if (!containerRef.current) return
    const found: { id: string; element: HTMLElement }[] = []
    containerRef.current.querySelectorAll<HTMLElement>('[data-island]').forEach((el) => {
      const id = el.dataset.island
      if (id && ISLANDS[id]) {
        found.push({ id, element: el })
      }
    })
    setIslands(found)
  }, [html])

  // html is pre-rendered from our markdown pipeline through rehype (sanitized, no user input)
  return (
    <>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
      {islands.map(({ id, element }) => {
        const Component = ISLANDS[id]
        return (
          <Suspense key={id} fallback={null}>
            <IslandPortal element={element}>
              <Component />
            </IslandPortal>
          </Suspense>
        )
      })}
    </>
  )
}

function IslandPortal({
  element,
  children,
}: {
  element: HTMLElement
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const portalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrapper = document.createElement('div')
    element.innerHTML = ''
    element.appendChild(wrapper)
    portalRef.current = wrapper
    setMounted(true)
    return () => {
      element.innerHTML = ''
    }
  }, [element])

  if (!mounted || !portalRef.current) return null
  return createPortal(children, portalRef.current)
}
