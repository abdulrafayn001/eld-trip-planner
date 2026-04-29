/**
 * `useGeocodeSearch` — `GET /api/geocode/?q=...` for autocomplete.
 *
 * The backend proxies Nominatim with caching + 1 req/s throttling, so
 * the hook's job here is just transport + TanStack-Query state. The
 * caller is responsible for passing an already-debounced query string;
 * this hook only short-circuits queries shorter than the configured
 * minimum so the network is silent until the user has typed enough to
 * meaningfully match.
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch, type ApiError } from '@/lib/api'
import type { LocationOption } from '@/lib/tripInput'

interface GeocodeResponse {
  results: LocationOption[]
}

export const MIN_GEOCODE_QUERY_LENGTH = 2

interface UseGeocodeSearchOptions {
  /** Debounced query string. */
  query: string
  /** Max number of candidates the server should return (default 6). */
  limit?: number
}

export function useGeocodeSearch({ query, limit = 6 }: UseGeocodeSearchOptions) {
  const trimmed = query.trim()
  const enabled = trimmed.length >= MIN_GEOCODE_QUERY_LENGTH

  return useQuery<LocationOption[], ApiError>({
    queryKey: ['geocode', trimmed, limit],
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams({ q: trimmed, limit: String(limit) })
      const data = await apiFetch<GeocodeResponse>(`/api/geocode/?${params}`)
      return data.results
    },
  })
}
