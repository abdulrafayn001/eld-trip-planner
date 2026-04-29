import { Outlet } from 'react-router'
import { AppHeader } from '@/components/AppHeader'

export default function App() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  )
}
