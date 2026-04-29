import { Outlet } from 'react-router'
import Box from '@mui/material/Box'
import { useAuth } from '@/auth/useAuth'
import { AppHeader } from '@/components/AppHeader'
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
  MobileBottomNav,
} from '@/components/MobileBottomNav'

export default function App() {
  const { isAuthenticated } = useAuth()
  return (
    <>
      <AppHeader />
      <Box
        sx={{
          pb: {
            xs: isAuthenticated ? `${MOBILE_BOTTOM_NAV_HEIGHT + 8}px` : 0,
            sm: 0,
          },
        }}
      >
        <Outlet />
      </Box>
      <MobileBottomNav />
    </>
  )
}
