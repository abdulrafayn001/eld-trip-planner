import { createContext } from 'react'
import type { AuthSession, AuthUser } from '@/lib/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (session: AuthSession) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
