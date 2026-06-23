import { useEffect, useState } from 'react'

/**
 * Tracks the viewport width and derives layout breakpoints. Used to make the inline-styled
 * screens responsive (the codebase has no CSS framework / media queries).
 *
 * Breakpoints: mobile ≤ 640px, compact (mobile or tablet) ≤ 1024px.
 */
export type Viewport = {
  width: number
  isMobile: boolean
  isCompact: boolean
}

function read(): Viewport {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280
  return { width, isMobile: width <= 640, isCompact: width <= 1024 }
}

export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(read)

  useEffect(() => {
    // Subscribe to resize; setState happens in the (async) event callback, not synchronously.
    const onResize = () => setViewport(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return viewport
}
