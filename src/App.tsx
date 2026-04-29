import { Outlet } from 'react-router'
import Box from '@mui/material/Box'
import { AppHeader } from '@/components/AppHeader'
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
  MobileBottomNav,
} from '@/components/MobileBottomNav'

export default function App() {
  return (
    <>
      <AppHeader />
      <Box sx={{ pb: { xs: `${MOBILE_BOTTOM_NAV_HEIGHT + 8}px`, sm: 0 } }}>
        <Outlet />
      </Box>
      <MobileBottomNav />
    </>
  )
}
