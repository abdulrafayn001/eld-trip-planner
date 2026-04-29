import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Brightness4 from '@mui/icons-material/Brightness4'
import Brightness7 from '@mui/icons-material/Brightness7'
import LocalShipping from '@mui/icons-material/LocalShipping'
import { useThemeMode } from '@/theme/useThemeMode'

export function AppHeader() {
  const { mode, toggleMode } = useThemeMode()
  const isDark = mode === 'dark'

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <LocalShipping sx={{ mr: 1.5, color: 'primary.main' }} aria-hidden />
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 500 }}>
          ELD Trip Planner
        </Typography>
        <Box>
          <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleMode}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              color="inherit"
            >
              {isDark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
