/**
 * `useTrips` — paginated query hook for `GET /api/trips/`.
 *
 * Backed by `useInfiniteQuery` so the trips list page can fetch the next
 * page as the user scrolls. The query key stays a stable `['trips']` so
 * `useCreateTrip` can invalidate the whole infinite cache after a new
 * trip is planned.
 */
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { apiFetch, type ApiError } from '@/lib/api'
import {
  offsetFromNextUrl,
  type PaginatedResponse,
} from '@/lib/pagination'
import type { TripSummary } from '@/lib/trip'

export const tripsQueryKey = ['trips'] as const

const PAGE_LIMIT = 10

type TripsPage = PaginatedResponse<TripSummary>

export function useTrips() {
  return useInfiniteQuery<
    TripsPage,
    ApiError,
    InfiniteData<TripsPage, number>,
    typeof tripsQueryKey,
    number
  >({
    queryKey: tripsQueryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      apiFetch<TripsPage>(
        `/api/trips/?limit=${PAGE_LIMIT}&offset=${pageParam}`,
      ),
    getNextPageParam: (lastPage) => offsetFromNextUrl(lastPage.next),
  })
}
