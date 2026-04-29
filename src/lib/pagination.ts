/**
 * Wire format for DRF `LimitOffsetPagination` responses + a small helper
 * for plumbing the next-page offset into TanStack `useInfiniteQuery`.
 *
 * Lives in its own module so any future paginated endpoint can share the
 * type without each query hook reimplementing the parsing logic.
 */

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export function offsetFromNextUrl(next: string | null): number | undefined {
  if (!next) return undefined
  const url = new URL(next, window.location.origin)
  const offset = url.searchParams.get('offset')
  if (offset === null) return undefined
  const parsed = Number(offset)
  return Number.isFinite(parsed) ? parsed : undefined
}
