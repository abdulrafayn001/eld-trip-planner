/**
 * Shared chrome for the login/register pages — Container → Card → header
 * → form Stack → footer link. Keeps the two auth pages visually identical
 * without each maintaining its own copy of the layout.
 */
import type { FormEventHandler, ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface AuthFormShellProps {
  headingId: string
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
  title,
  subtitle,
  onSubmit,
  children,
  footer,
}: AuthFormShellProps) {
  return (
    <Container maxWidth="xs" component="main">
      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Card component="section" aria-labelledby={headingId} variant="outlined">
          <CardContent>
            <Typography id={headingId} variant="h5" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
            <Stack
              component="form"
              spacing={2}
              noValidate
              onSubmit={onSubmit}
            >
              {children}
            </Stack>
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
              {footer.prompt}{' '}
              <Link component={RouterLink} to={footer.linkTo}>
                {footer.linkLabel}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
