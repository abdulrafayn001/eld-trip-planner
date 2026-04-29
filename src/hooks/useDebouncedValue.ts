/**
 * `useDebouncedValue` — returns ``value`` delayed by ``delayMs``.
 *
 * Single-purpose helper for search-as-you-type inputs: typing fans into
 * the latest debounced snapshot, and we let TanStack Query take it from
 * there (caching, deduplication, in-flight cancellation).
 */
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(handle)
  }, [value, delayMs])

  return debounced
}
