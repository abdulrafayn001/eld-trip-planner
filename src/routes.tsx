import { createBrowserRouter } from 'react-router'
import App from '@/App'
import { RedirectIfAuthed } from '@/auth/RedirectIfAuthed'
import { RequireAuth } from '@/auth/RequireAuth'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import TripPage from '@/pages/TripPage'
import TripsPage from '@/pages/TripsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        Component: RedirectIfAuthed,
        children: [
          { path: 'login', Component: LoginPage },
          { path: 'register', Component: RegisterPage },
        ],
      },
      {
        Component: RequireAuth,
        children: [
          { index: true, Component: TripsPage },
          { path: 'plan', Component: HomePage },
          { path: 'trip/:id', Component: TripPage },
        ],
      },
    ],
  },
])
