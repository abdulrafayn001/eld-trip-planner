import { createTheme, type Theme } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'

export function getTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1f6feb' : '#79b8ff' },
      background: {
        default: mode === 'light' ? '#f7f8fa' : '#0d1117',
        paper: mode === 'light' ? '#ffffff' : '#161b22',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em' },
      h2: { fontSize: '2rem', fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.01em' },
      h3: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.35 },
      h5: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4 },
      h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
    },
  })
}
