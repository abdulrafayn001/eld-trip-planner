/**
 * Shared chrome for the login/register pages — backdrop → branded card →
 * sign-in/create-account toggle → form Stack → footer link. Keeps the
 * two auth pages visually identical without each maintaining its own
 * copy of the layout.
 */
import type { FormEventHandler, ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import LocalShipping from '@mui/icons-material/LocalShipping'

type AuthMode = 'signin' | 'signup'

interface AuthFormShellProps {
  headingId: string
  mode: AuthMode
  title: string
  subtitle: string
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  footer: {
    prompt: string
    linkLabel: string
    linkTo: string
  }
}

export function AuthFormShell({
  headingId,
  mode,
  title,
  subtitle,
  onSubmit,
  children,
  footer,
}: AuthFormShellProps) {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        py: { xs: 3, sm: 4 },
        px: 2,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? `radial-gradient(circle at 0% 0%, rgba(30,106,232,0.06), transparent 50%),
               radial-gradient(circle at 100% 100%, rgba(201,122,20,0.05), transparent 50%),
               ${theme.palette.background.default}`
            : theme.palette.background.default,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(26,32,39,0.025) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(26,32,39,0.025) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 0%, transparent 70%)',
        },
      }}
    >
      <Container maxWidth="xs" component="main" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          component="section"
          aria-labelledby={headingId}
          sx={{
            borderRadius: 3,
            boxShadow: 8,
            p: { xs: 3, sm: 4 },
          }}
        >
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, mb: 1.75 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #1E6AE8 0%, #134397 100%)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 12px rgba(30,106,232,0.4)',
                }}
                aria-hidden
              >
                <LocalShipping sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
                ELD Trip Planner
              </Typography>
            </Stack>

            <ToggleButtonGroup
              value={mode}
              exclusive
              fullWidth
              onChange={(_, value: AuthMode | null) => {
                if (!value || value === mode) return
                void navigate(value === 'signin' ? '/login' : '/register')
              }}
              sx={{
                mb: 2,
                p: 0.5,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light' ? '#ECEFF3' : 'rgba(255,255,255,0.06)',
                borderRadius: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  border: 0,
                  height: 34,
                  borderRadius: '6px !important',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1,
                    '&:hover': { backgroundColor: 'background.paper' },
                  },
                },
              }}
            >
              <ToggleButton value="signin">Sign in</ToggleButton>
              <ToggleButton value="signup">Create account</ToggleButton>
            </ToggleButtonGroup>

            <Typography
              id={headingId}
              variant="h5"
              component="h1"
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>

            <Stack
              component="form"
              spacing={1.5}
              noValidate
              onSubmit={onSubmit}
            >
              {children}
            </Stack>

            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              {footer.prompt}{' '}
              <Link component={RouterLink} to={footer.linkTo} sx={{ fontWeight: 500 }}>
                {footer.linkLabel}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
