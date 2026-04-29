/**
 * DRF auth-token persistence (Phase B7 backend uses TokenAuthentication —
 * the `Authorization: Token <key>` header).
 *
 * Single responsibility: read/write the token in localStorage. The api
 * client consumes these accessors; auth UI flows (register/login) write
 * to them on success and clear them on logout.
 */
const TOKEN_STORAGE_KEY = 'eld:auth-token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}
