/**
 * `useCreateTrip` — mutation for `POST /api/trips/`.
 *
 * Owns the network call and global side effects (loading + success +
 * error toasts, query-cache invalidation). Navigation is left to the
 * caller so the Plan page can render an inline preview before letting
 * the driver continue to the full trip view.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar, type SnackbarKey } from 'notistack'
import { apiFetch, type ApiError } from '@/lib/api'
import { tripsQueryKey } from '@/hooks/useTrips'
import type { TripInput } from '@/lib/tripInput'

interface CreateTripResponse {
  id: string
}

interface CreateTripContext {
  pendingToastKey: SnackbarKey
}

export function useCreateTrip() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  return useMutation<CreateTripResponse, ApiError, TripInput, CreateTripContext>({
    mutationFn: (input) =>
      apiFetch<CreateTripResponse>('/api/trips/', {
        method: 'POST',
        body: input,
      }),
    // Planning a trip can take several seconds (geocode + route + plan +
    // log build). Show a persistent "in flight" toast on mutate so the
    // submit button's spinner isn't the only feedback.
    onMutate: () => ({
      pendingToastKey: enqueueSnackbar('Planning your route…', {
        variant: 'info',
        persist: true,
      }),
    }),
    onSettled: (_data, _error, _variables, context) => {
      if (context) closeSnackbar(context.pendingToastKey)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tripsQueryKey })
      enqueueSnackbar('Trip planned', { variant: 'success' })
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Could not plan trip', { variant: 'error' })
    },
  })
}
