/**
 * DRF auth-token persistence (`Authorization: Token <key>`).
 *
 * Single responsibility: read/write the auth session in localStorage and
 * notify the rest of the app (within and across tabs) when it changes.
 * The api client reads the token; AuthContext subscribes to changes.
 */
const TOKEN_STORAGE_KEY = 'eld:auth-token'
const USER_STORAGE_KEY = 'eld:auth-user'

export const AUTH_CHANGED_EVENT = 'eld:auth-changed'

export interface AuthUser {
  username: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
  const userRaw = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!token || !userRaw) return null
  try {
    const user = JSON.parse(userRaw) as AuthUser
    if (typeof user?.username !== 'string') return null
    return { token, user }
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token)
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user))
  notifyAuthChanged()
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(USER_STORAGE_KEY)
  notifyAuthChanged()
}

function notifyAuthChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}
