/**
 * Header user chip + dropdown menu for the signed-in user. On sign
 * out: clear the session, drop the React Query cache (so a different
 * driver who signs in next won't see the previous user's trips), and
 * redirect to /login.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import RouteRounded from '@mui/icons-material/RouteRounded'
import { useAuth } from '@/auth/useAuth'
import { FONT_MONO } from '@/theme/theme'

export function AuthMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (!user) return null

  const open = Boolean(anchorEl)
  const initial = user.username.charAt(0).toUpperCase()

  const handleSignOut = () => {
    setAnchorEl(null)
    queryClient.clear()
    signOut()
    void navigate('/login', { replace: true })
  }

  const handleMyTrips = () => {
    setAnchorEl(null)
    void navigate('/')
  }

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.25,
          padding: '4px 8px 4px 12px',
          borderRadius: 999,
          transition: 'background-color 150ms',
          whiteSpace: 'nowrap',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'flex-end',
            lineHeight: 1.1,
          }}
        >
          <Typography
            component="span"
            sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2, color: 'text.primary' }}
          >
            {user.username}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Driver · CDL-A
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #E8B45A 0%, #C97A14 100%)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          {initial}
        </Avatar>
        <KeyboardArrowDown fontSize="small" sx={{ color: 'text.secondary' }} />
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
          <Typography variant="caption" color="text.secondary" component="div">
            Signed in as
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }} component="div">
            {user.username}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleMyTrips}>
          <ListItemIcon>
            <RouteRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>My trips</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
