/**
 * Header avatar-button + dropdown menu for the signed-in user. On sign
 * out: clear the session, drop the React Query cache (so a different
 * driver who signs in next won't see the previous user's trips), and
 * redirect to /login.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import RouteRounded from '@mui/icons-material/RouteRounded'
import { useAuth } from '@/auth/useAuth'

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
    void navigate('/trips')
  }

  return (
    <>
      <Tooltip title={`Signed in as ${user.username}`}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          size="small"
          sx={{ ml: 1 }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
            {initial}
          </Avatar>
        </IconButton>
      </Tooltip>
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
