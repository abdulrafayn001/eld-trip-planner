/**
 * `useRegister` — mutation for `POST /api/auth/register/`.
 *
 * Single responsibility: own the network call and follow-on effects.
 * The form sends `confirmPassword` for client-side validation only;
 * we strip it before posting so the API contract stays {username,
 * password}. The response shape mirrors `useLogin` — we tolerate a
 * token-only response and seed the username from the form input.
 */
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useSnackbar } from 'notistack'
import { useAuth } from '@/auth/useAuth'
import type { RegisterInput } from '@/auth/authSchemas'
import { apiFetch, type ApiError } from '@/lib/api'
import type { AuthSession } from '@/lib/auth'

interface RegisterResponse {
  token: string
  user?: { username?: string }
}

export function useRegister() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation<AuthSession, ApiError, RegisterInput>({
    mutationFn: async ({ username, password }) => {
      const response = await apiFetch<RegisterResponse>('/api/auth/register/', {
        method: 'POST',
        body: { username, password },
      })
      return {
        token: response.token,
        user: { username: response.user?.username ?? username },
      }
    },
    onSuccess: (session) => {
      signIn(session)
      enqueueSnackbar(`Account created — welcome, ${session.user.username}`, {
        variant: 'success',
      })
      void navigate('/', { replace: true })
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Could not create account', { variant: 'error' })
    },
  })
}
