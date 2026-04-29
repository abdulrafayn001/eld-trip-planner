/**
 * `useDeleteTrip` — mutation for `DELETE /api/trips/{id}/`.
 *
 * Owns the network call, success/error toasts, and trips-list cache
 * invalidation so the deleted trip drops out of the infinite-scroll feed.
 * Navigation is left to the caller (cards stay in place; the detail page
 * routes home).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { apiFetch, type ApiError } from '@/lib/api'
import { tripsQueryKey } from '@/hooks/useTrips'

export function useDeleteTrip() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation<void, ApiError, string>({
    mutationFn: (tripId) =>
      apiFetch<void>(`/api/trips/${tripId}/`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tripsQueryKey })
      enqueueSnackbar('Trip deleted', { variant: 'success' })
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Could not delete trip', {
        variant: 'error',
      })
    },
  })
}
