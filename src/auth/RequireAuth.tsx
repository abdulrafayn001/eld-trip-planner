/**
 * Layout route guard for authenticated areas. Bounces unauthenticated
 * visitors to `/login` and stashes the intended URL in `location.state`
 * so login can redirect them back after sign-in.
 */
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`
    return <Navigate to="/login" replace state={{ from }} />
  }
  return <Outlet />
}
