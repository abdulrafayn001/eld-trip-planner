import { Link as RouterLink } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Brightness4 from '@mui/icons-material/Brightness4'
import Brightness7 from '@mui/icons-material/Brightness7'
import LocalShipping from '@mui/icons-material/LocalShipping'
import { useAuth } from '@/auth/useAuth'
import { AuthMenu } from '@/components/AuthMenu'
import { useThemeMode } from '@/theme/useThemeMode'

export function AppHeader() {
  const { mode, toggleMode } = useThemeMode()
  const { isAuthenticated } = useAuth()
  const isDark = mode === 'dark'

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: { xs: 0.5, md: 3 }, minWidth: 0 }}>
        <Stack
          direction="row"
          component={isAuthenticated ? RouterLink : 'div'}
          {...(isAuthenticated ? { to: '/' } : {})}
          sx={{
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1E6AE8 0%, #134397 100%)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 2px 6px rgba(30,106,232,0.35)',
            }}
            aria-hidden
          >
            <LocalShipping sx={{ fontSize: 20 }} />
          </Box>
          <Typography
            component="span"
            sx={{
              fontSize: { xs: 16, sm: 17 },
              fontWeight: 700,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            ELD Trip Planner
          </Typography>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleMode}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              size="medium"
              sx={{ color: 'text.secondary' }}
            >
              {isDark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          {isAuthenticated && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: 28,
                  backgroundColor: 'divider',
                  mx: 0.5,
                  display: { xs: 'none', sm: 'block' },
                }}
                aria-hidden
              />
              <AuthMenu />
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
