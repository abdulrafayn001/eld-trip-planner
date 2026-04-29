/**
 * `useTrip(id)` — query hook for `GET /api/trips/{id}/`.
 *
 * Returns the typed TanStack Query result so consumers get
 * `query.error` typed as `ApiError | null` for the error path.
 */
import { useQuery } from '@tanstack/react-query'
import { apiFetch, type ApiError } from '@/lib/api'
import type { Trip } from '@/lib/trip'

export function tripQueryKey(id: string) {
  return ['trip', id] as const
}

export function useTrip(id: string) {
  return useQuery<Trip, ApiError>({
    queryKey: tripQueryKey(id),
    queryFn: () => apiFetch<Trip>(`/api/trips/${id}/`),
    enabled: id.length > 0,
  })
}
