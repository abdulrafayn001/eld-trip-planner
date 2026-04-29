/**
 * Auth provider — single source of truth for the signed-in user.
 *
 * Single responsibility: hydrate the session from localStorage on mount,
 * expose `signIn`/`signOut` mutators, and re-read the session whenever
 * `auth.ts` broadcasts a change (in-tab via custom event, cross-tab via
 * the native `storage` event). The api client clears the session on 401,
 * which fires the same event — so an expired token bubbles up here
 * without each caller having to handle it.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from './authContextValue'
import {
  AUTH_CHANGED_EVENT,
  clearSession as clearStoredSession,
  loadSession,
  saveSession,
  type AuthSession,
} from '@/lib/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  useEffect(() => {
    const sync = () => setSession(loadSession())
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const signIn = (next: AuthSession) => {
    saveSession(next)
    setSession(next)
  }

  const signOut = () => {
    clearStoredSession()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isAuthenticated: session !== null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
