import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { AuthFormShell } from '@/components/AuthFormShell'
import { loginSchema, type LoginInput } from '@/auth/authSchemas'
import { useLogin } from '@/hooks/useLogin'

const HEADING_ID = 'login-heading'

export default function LoginPage() {
  const login = useLogin()
  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onBlur',
  })

  const isPending = login.isPending

  return (
    <AuthFormShell
      headingId={HEADING_ID}
      mode="signin"
      title="Welcome back"
      subtitle="Pick up your in-progress trip or plan a new one."
      onSubmit={handleSubmit((data) => login.mutate(data))}
      footer={{
        prompt: "Don't have an account?",
        linkLabel: 'Create one',
        linkTo: '/register',
      }}
    >
      <Controller
        name="username"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Username"
            autoComplete="username"
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? ' '}
            required
            fullWidth
            autoFocus
            disabled={isPending}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="password"
            label="Password"
            autoComplete="current-password"
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? ' '}
            required
            fullWidth
            disabled={isPending}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </AuthFormShell>
  )
}
