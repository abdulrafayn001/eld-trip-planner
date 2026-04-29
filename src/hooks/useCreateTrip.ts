/**
 * `useCreateTrip` — mutation for `POST /api/trips/`.
 *
 * Single responsibility: own the network call and the side effects that
 * follow it (success toast + navigation, error toast). The form is a pure
 * presentational concern — it consumes `mutate` and `isPending` only.
 */
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useSnackbar, type SnackbarKey } from 'notistack'
import { apiFetch, type ApiError } from '@/lib/api'
import type { TripInput } from '@/lib/tripInput'

interface CreateTripResponse {
  id: string
}

interface CreateTripContext {
  pendingToastKey: SnackbarKey
}

export function useCreateTrip() {
  const navigate = useNavigate()
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
    onSuccess: ({ id }) => {
      enqueueSnackbar('Trip planned', { variant: 'success' })
      void navigate(`/trip/${id}`)
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Could not plan trip', { variant: 'error' })
    },
  })
}
