/**
 * `useLogin` — mutation for `POST /api/auth/login/`.
 *
 * Single responsibility: own the network call and the side effects that
 * follow it (persist session, success toast, navigate back to the page
 * the user was trying to reach, error toast).
 *
 * The DRF `obtain_auth_token` view returns just `{token}`, so we seed
 * the username from the form input. If the backend ever starts returning
 * a richer `{token, user}` shape, we prefer the canonical username it
 * provides.
 */
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { useSnackbar } from 'notistack'
import { useAuth } from '@/auth/useAuth'
import type { LoginInput } from '@/auth/authSchemas'
import { apiFetch, type ApiError } from '@/lib/api'
import type { AuthSession } from '@/lib/auth'

interface LoginResponse {
  token: string
  user?: { username?: string }
}

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation<AuthSession, ApiError, LoginInput>({
    mutationFn: async (input) => {
      const response = await apiFetch<LoginResponse>('/api/auth/login/', {
        method: 'POST',
        body: input,
      })
      return {
        token: response.token,
        user: { username: response.user?.username ?? input.username },
      }
    },
    onSuccess: (session) => {
      signIn(session)
      enqueueSnackbar(`Welcome back, ${session.user.username}`, { variant: 'success' })
      const from = (location.state as { from?: string } | null)?.from
      void navigate(from ?? '/', { replace: true })
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Could not sign in', { variant: 'error' })
    },
  })
}
