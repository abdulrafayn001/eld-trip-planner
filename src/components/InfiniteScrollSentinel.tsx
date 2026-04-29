/**
 * Invisible sentinel `<div>` that fires `onIntersect` when it scrolls into
 * view. Pair with TanStack `useInfiniteQuery.fetchNextPage` to implement
 * infinite scrolling without a "Load more" button.
 */
import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'

interface InfiniteScrollSentinelProps {
  onIntersect: () => void
  disabled?: boolean
  rootMargin?: string
}

export function InfiniteScrollSentinel({
  onIntersect,
  disabled = false,
  rootMargin = '200px',
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect()
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [onIntersect, disabled, rootMargin])

  return <Box ref={ref} aria-hidden sx={{ height: 1, width: '100%' }} />
}
