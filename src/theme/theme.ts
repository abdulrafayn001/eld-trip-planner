import { createTheme, type Theme } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'

export const FONT_SANS = '"Inter", "Roboto", system-ui, -apple-system, "Segoe UI", sans-serif'
export const FONT_MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace'

const PRIMARY = {
  50: '#E8F1FE',
  100: '#CFE2FD',
  200: '#9FC4FB',
  300: '#6FA6F8',
  400: '#4C8DF5',
  500: '#1E6AE8',
  600: '#1856C2',
  700: '#134397',
  800: '#0E316E',
  900: '#0A2148',
}

const SECONDARY = {
  main: '#C97A14',
  soft: '#FBEFD8',
}

const SHADOW_APPBAR = '0px 1px 0px rgba(26,32,39,0.06), 0px 1px 3px rgba(26,32,39,0.04)'
const SHADOW_1 =
  '0px 2px 1px -1px rgba(0,0,0,0.10), 0px 1px 1px 0px rgba(0,0,0,0.07), 0px 1px 3px 0px rgba(0,0,0,0.06)'
const SHADOW_2 =
  '0px 3px 1px -2px rgba(0,0,0,0.10), 0px 2px 2px 0px rgba(0,0,0,0.07), 0px 1px 5px 0px rgba(0,0,0,0.06)'
const SHADOW_3 =
  '0px 3px 3px -2px rgba(0,0,0,0.10), 0px 3px 4px 0px rgba(0,0,0,0.07), 0px 1px 8px 0px rgba(0,0,0,0.06)'
const SHADOW_4 =
  '0px 2px 4px -1px rgba(0,0,0,0.10), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.06)'
const SHADOW_6 =
  '0px 3px 5px -1px rgba(0,0,0,0.10), 0px 6px 10px 0px rgba(0,0,0,0.07), 0px 1px 18px 0px rgba(0,0,0,0.06)'
const SHADOW_8 =
  '0px 5px 5px -3px rgba(0,0,0,0.10), 0px 8px 10px 1px rgba(0,0,0,0.07), 0px 3px 14px 2px rgba(0,0,0,0.06)'

const muiShadows: Theme['shadows'] = [
  'none',
  SHADOW_1,
  SHADOW_2,
  SHADOW_3,
  SHADOW_4,
  SHADOW_4,
  SHADOW_6,
  SHADOW_6,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
  SHADOW_8,
] as Theme['shadows']

export function getTheme(mode: ThemeMode): Theme {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? PRIMARY[500] : PRIMARY[300],
        light: isLight ? PRIMARY[400] : PRIMARY[200],
        dark: isLight ? PRIMARY[700] : PRIMARY[500],
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: SECONDARY.main,
        light: SECONDARY.soft,
        contrastText: '#FFFFFF',
      },
      background: {
        default: isLight ? '#F4F6F8' : '#0d1117',
        paper: isLight ? '#FFFFFF' : '#161b22',
      },
      text: {
        primary: isLight ? '#1A2027' : '#E6EDF3',
        secondary: isLight ? '#3E4C59' : '#9AA4B0',
      },
      divider: isLight ? 'rgba(26, 32, 39, 0.08)' : 'rgba(255, 255, 255, 0.10)',
      success: { main: '#2E7D32', light: '#E8F4E9', contrastText: '#FFFFFF' },
      warning: { main: '#C77B14', light: '#FBEFD8', contrastText: '#FFFFFF' },
      error: { main: '#C62828', light: '#FCE8E6', contrastText: '#FFFFFF' },
      info: { main: '#1565C0', light: '#E1ECFB', contrastText: '#FFFFFF' },
    },
    typography: {
      fontFamily: FONT_SANS,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
      h6: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 },
      body1: { fontSize: '0.875rem', lineHeight: 1.55 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: '0.02em' },
      caption: { fontSize: '0.75rem', lineHeight: 1.4, color: 'inherit' },
      overline: {
        fontFamily: FONT_MONO,
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        lineHeight: 1.2,
      },
    },
    shape: { borderRadius: 8 },
    shadows: muiShadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFeatureSettings: '"cv11"',
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'optimizeLegibility',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'default' },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: SHADOW_APPBAR,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: SHADOW_1,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: false },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            height: 40,
            paddingLeft: 18,
            paddingRight: 18,
            fontWeight: 500,
          },
          sizeLarge: {
            height: 48,
            paddingLeft: 24,
            paddingRight: 24,
            fontSize: '0.9375rem',
          },
          sizeSmall: {
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            fontSize: '0.8125rem',
          },
          contained: {
            boxShadow: SHADOW_2,
            '&:hover': { boxShadow: SHADOW_4 },
            '&:active': { boxShadow: SHADOW_1 },
          },
          outlined: {
            borderColor: 'rgba(30,106,232,0.5)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          notchedOutline: {
            borderColor: 'rgba(26, 32, 39, 0.23)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            letterSpacing: '0.02em',
          },
          sizeSmall: {
            height: 24,
            fontSize: '0.6875rem',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            backgroundColor: 'rgba(26, 32, 39, 0.92)',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 64,
            '@media (min-width: 600px)': { minHeight: 64 },
          },
        },
      },
    },
  })
}
