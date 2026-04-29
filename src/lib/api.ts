/**
 * Auth-aware fetch wrapper for the Django backend (DRF TokenAuthentication).
 *
 * Single responsibility: HTTP transport. Pulls the token from `@/lib/auth`,
 * injects `Authorization: Token <key>` when present, JSON-encodes bodies,
 * and throws a typed `ApiError` on non-2xx so React Query can render the
 * error path.
 */
import { clearSession, getAuthToken } from '@/lib/auth'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, headers: headerInit, ...rest } = options

  const headers = new Headers(headerInit)
  headers.set('Accept', 'application/json')
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Token ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const parsed: unknown = text ? safeJsonParse(text) : null

  if (!response.ok) {
    // 401 means the token is missing/expired/revoked. Clear the session so
    // AuthContext re-renders and RequireAuth bounces the user to /login.
    if (response.status === 401) clearSession()
    throw new ApiError(
      response.status,
      extractErrorMessage(parsed) ?? response.statusText,
      parsed,
    )
  }

  return parsed as T
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * DRF returns errors as either `{detail: "msg"}` or `{field: ["msg"]}`.
 * Surface the first human-readable string so toasts/alerts have content.
 */
function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const obj = payload as Record<string, unknown>
  if (typeof obj.detail === 'string') return obj.detail
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') return value
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  }
  return null
}
