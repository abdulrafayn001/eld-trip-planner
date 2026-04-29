/**
 * `useCreateTrip` — mutation for `POST /api/trips/`.
 *
 * Single responsibility: own the network call and the side effects that
 * follow it (success toast + navigation, error toast). The form is a pure
 * presentational concern — it consumes `mutate` and `isPending` only.
 */
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useSnackbar } from 'notistack'
import { apiFetch, type ApiError } from '@/lib/api'
import type { TripInput } from '@/lib/tripInput'

interface CreateTripResponse {
  id: string
}

export function useCreateTrip() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation<CreateTripResponse, ApiError, TripInput>({
    mutationFn: (input) =>
      apiFetch<CreateTripResponse>('/api/trips/', {
        method: 'POST',
        body: input,
      }),
    onSuccess: ({ id }) => {
      enqueueSnackbar('Trip planned', { variant: 'success' })
      void navigate(`/trip/${id}`)
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Could not plan trip', { variant: 'error' })
    },
  })
}
