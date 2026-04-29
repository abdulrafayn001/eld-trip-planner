import { Controller, useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { tripInputSchema, type TripInput } from '@/lib/tripInput'

interface TripFormProps {
  defaultValues: TripInput
  isPending: boolean
  onSubmit: (data: TripInput) => void
}

const HEADING_ID = 'trip-form-heading'

export function TripForm({ defaultValues, isPending, onSubmit }: TripFormProps) {
  const { control, handleSubmit } = useForm<TripInput>({
    resolver: zodResolver(tripInputSchema),
    defaultValues,
    mode: 'onBlur',
  })

  return (
    <Card component="section" aria-labelledby={HEADING_ID} variant="outlined">
      <CardContent>
        <Typography id={HEADING_ID} variant="h6" component="h2" gutterBottom>
          Trip details
        </Typography>
        <Stack
          component="form"
          spacing={2}
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <LocationField
            control={control}
            name="current"
            label="Current location"
            placeholder="Los Angeles, CA"
            disabled={isPending}
            autoFocus
          />
          <LocationField
            control={control}
            name="pickup"
            label="Pickup location"
            placeholder="Dallas, TX"
            disabled={isPending}
          />
          <LocationField
            control={control}
            name="dropoff"
            label="Drop-off location"
            placeholder="Atlanta, GA"
            disabled={isPending}
          />
          <Controller
            name="cycle_used_hrs"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Cycle used (hrs)"
                type="number"
                value={Number.isFinite(field.value) ? field.value : ''}
                onChange={(e) => {
                  const v = e.target.value
                  field.onChange(v === '' ? Number.NaN : Number(v))
                }}
                onBlur={field.onBlur}
                inputRef={field.ref}
                slotProps={{ htmlInput: { step: 0.1, min: 0, max: 70 } }}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? '0–70, one decimal'}
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
            startIcon={
              isPending ? <CircularProgress size={18} color="inherit" /> : undefined
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            {isPending ? 'Planning…' : 'Plan trip'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

interface LocationFieldProps {
  control: Control<TripInput>
  name: 'current' | 'pickup' | 'dropoff'
  label: string
  placeholder: string
  disabled: boolean
  autoFocus?: boolean
}

function LocationField({
  control,
  name,
  label,
  placeholder,
  disabled,
  autoFocus,
}: LocationFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          placeholder={placeholder}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? ' '}
          autoComplete="off"
          autoFocus={autoFocus}
          required
          fullWidth
          disabled={disabled}
        />
      )}
    />
  )
}
