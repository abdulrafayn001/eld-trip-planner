/**
 * Layout route guard for the login/register pages. Authed users have no
 * business there — send them to the home page instead of letting them
 * sign in twice.
 */
import { Navigate, Outlet } from 'react-router'
import { useAuth } from './useAuth'

export function RedirectIfAuthed() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
