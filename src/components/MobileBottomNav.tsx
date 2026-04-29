import { useState, type MouseEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import PersonRounded from '@mui/icons-material/PersonRounded'
import RouteRounded from '@mui/icons-material/RouteRounded'
import { useAuth } from '@/auth/useAuth'

export const MOBILE_BOTTOM_NAV_HEIGHT = 64

export function MobileBottomNav() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null)

  if (!isAuthenticated) return null

  const path = location.pathname
  const isPlan = path === '/plan'
  const isTrips = path === '/' || path.startsWith('/trip')

  return (
    <>
      <Paper
        component="nav"
        aria-label="Primary"
        elevation={8}
        square
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'stretch',
          justifyContent: 'space-around',
          paddingTop: 0.75,
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <NavTab
          label="Plan"
          to="/plan"
          icon={<AutoAwesomeRounded sx={{ fontSize: 22 }} />}
          active={isPlan}
        />
        <NavTab
          label="Trips"
          to="/"
          icon={<RouteRounded sx={{ fontSize: 22 }} />}
          active={isTrips}
        />
        <NavTab
          label="Profile"
          icon={<PersonRounded sx={{ fontSize: 22 }} />}
          active={Boolean(profileAnchor)}
          onClick={(e) => setProfileAnchor(e.currentTarget)}
        />
      </Paper>
      <ProfileMenu
        anchorEl={profileAnchor}
        onClose={() => setProfileAnchor(null)}
      />
    </>
  )
}

interface NavTabProps {
  label: string
  icon: React.ReactNode
  active: boolean
  to?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
}

function NavTab({ label, icon, active, to, onClick }: NavTabProps) {
  const common = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.25,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: active ? 'primary.main' : 'text.secondary',
    textDecoration: 'none',
    paddingY: 0.5,
    fontFamily: 'inherit',
  } as const

  const content = (
    <>
      <Box
        sx={{
          width: 56,
          height: 28,
          borderRadius: 999,
          display: 'grid',
          placeItems: 'center',
          backgroundColor: active ? 'primary.light' : 'transparent',
          color: active ? 'primary.dark' : 'text.secondary',
          transition: 'background-color 150ms',
        }}
      >
        {icon}
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: 11,
          fontWeight: active ? 600 : 500,
          lineHeight: 1.2,
          color: active ? 'primary.main' : 'text.secondary',
        }}
      >
        {label}
      </Typography>
    </>
  )

  if (to) {
    return (
      <Box component={RouterLink} to={to} sx={common} aria-label={label}>
        {content}
      </Box>
    )
  }
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={common}
      aria-label={label}
    >
      {content}
    </Box>
  )
}

function ProfileMenu({
  anchorEl,
  onClose,
}: {
  anchorEl: HTMLElement | null
  onClose: () => void
}) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSignOut = () => {
    onClose()
    queryClient.clear()
    signOut()
    void navigate('/login', { replace: true })
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{ paper: { sx: { mb: 1, minWidth: 200 } } }}
    >
      {user && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" component="div">
            Signed in as
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }} component="div">
            {user.username}
          </Typography>
        </Box>
      )}
      <Divider />
      <MenuItem onClick={handleSignOut}>
        <ListItemIcon>
          <LogoutRounded fontSize="small" />
        </ListItemIcon>
        <ListItemText>Sign out</ListItemText>
      </MenuItem>
    </Menu>
  )
}
