import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { AuthFormShell } from '@/components/AuthFormShell'
import { registerSchema, type RegisterInput } from '@/auth/authSchemas'
import { useRegister } from '@/hooks/useRegister'

const HEADING_ID = 'register-heading'

export default function RegisterPage() {
  const register = useRegister()
  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  })

  const isPending = register.isPending

  return (
    <AuthFormShell
      headingId={HEADING_ID}
      title="Create account"
      subtitle="Sign up to save your trips and access your daily log sheets."
      onSubmit={handleSubmit((data) => register.mutate(data))}
      footer={{
        prompt: 'Already have an account?',
        linkLabel: 'Sign in',
        linkTo: '/login',
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
            helperText={fieldState.error?.message ?? '3–150 characters'}
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
            autoComplete="new-password"
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? 'At least 8 characters'}
            required
            fullWidth
            disabled={isPending}
          />
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="password"
            label="Confirm password"
            autoComplete="new-password"
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
        {isPending ? 'Creating account…' : 'Create account'}
      </Button>
    </AuthFormShell>
  )
}
