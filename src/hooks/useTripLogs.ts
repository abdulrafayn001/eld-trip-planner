/**
 * `useTripLogs(id)` — query hook for `GET /api/trips/<id>/logs/`.
 *
 * Backed by the dedicated DRF action that returns just the per-day log
 * structures (lighter payload than the full trip detail). TripPage uses
 * `useTrip` for summary/map and reads `trip.logs` directly to avoid a
 * redundant fetch; this hook stays available for any caller that only
 * needs the log array (e.g., a future print-only route).
 */
import { useQuery } from '@tanstack/react-query'
import { apiFetch, type ApiError } from '@/lib/api'
import type { DailyLog } from '@/lib/trip'

export function tripLogsQueryKey(id: string) {
  return ['trip-logs', id] as const
}

export function useTripLogs(id: string) {
  return useQuery<DailyLog[], ApiError>({
    queryKey: tripLogsQueryKey(id),
    queryFn: () => apiFetch<DailyLog[]>(`/api/trips/${id}/logs/`),
    enabled: id.length > 0,
  })
}
