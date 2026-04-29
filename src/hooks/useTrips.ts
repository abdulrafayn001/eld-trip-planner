/**
 * `useTrips` — query hook for `GET /api/trips/`.
 *
 * Returns the lightweight summary list for the authenticated user. Create
 * mutations invalidate `tripsQueryKey` so the list refreshes after a new
 * trip is planned.
 */
import { useQuery } from '@tanstack/react-query'
import { apiFetch, type ApiError } from '@/lib/api'
import type { TripSummary } from '@/lib/trip'

export const tripsQueryKey = ['trips'] as const

export function useTrips() {
  return useQuery<TripSummary[], ApiError>({
    queryKey: tripsQueryKey,
    queryFn: () => apiFetch<TripSummary[]>('/api/trips/'),
  })
}
