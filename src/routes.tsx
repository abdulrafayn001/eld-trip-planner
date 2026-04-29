import { createBrowserRouter } from 'react-router'
import App from '@/App'
import HomePage from '@/pages/HomePage'
import TripPage from '@/pages/TripPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: 'trip/:id', Component: TripPage },
    ],
  },
])
