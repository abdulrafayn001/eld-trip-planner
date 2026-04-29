import { Controller, useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import LocationOnRounded from '@mui/icons-material/LocationOnRounded'
import { CycleGaugeField } from '@/components/CycleGaugeField'
import { SAMPLE_TRIP_INPUT, tripInputSchema, type TripInput } from '@/lib/tripInput'
import { FONT_MONO } from '@/theme/theme'

interface TripFormProps {
  defaultValues: TripInput
  isPending: boolean
  onSubmit: (data: TripInput) => void
  onReset?: () => void
  /** Tighter padding/gauge so the form fits a 720h split layout. */
  compact?: boolean
  /** When set, an inline "Use sample" link populates the form. */
  onUseSample?: (input: TripInput) => void
}

const HEADING_ID = 'trip-form-heading'

type PinKind = 'start' | 'pickup' | 'drop'

function PinAdornment({ kind }: { kind: PinKind }) {
  const styles = {
    start: { backgroundColor: 'text.primary' },
    pickup: { backgroundColor: 'secondary.main' },
    drop: {
      backgroundColor: 'background.paper',
      border: '2px solid',
      borderColor: 'primary.main',
    },
  } as const
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        flexShrink: 0,
        ml: 0.5,
        mr: 0.5,
        ...styles[kind],
      }}
      aria-hidden
    />
  )
}

function LetterAdornment({ letter }: { letter: string }) {
  return (
    <Box
      sx={{
        ml: 1,
        px: 1,
        py: 0.25,
        backgroundColor: 'action.hover',
        color: 'text.secondary',
        fontFamily: FONT_MONO,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.04em',
        borderRadius: '4px',
      }}
      aria-hidden
    >
      {letter}
    </Box>
  )
}

export function TripForm({
  defaultValues,
  isPending,
  onSubmit,
  onReset,
  compact = false,
  onUseSample,
}: TripFormProps) {
  const { control, handleSubmit, reset } = useForm<TripInput>({
    resolver: zodResolver(tripInputSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const handleResetClick = () => {
    reset(defaultValues)
    onReset?.()
  }

  return (
    <Card component="section" aria-labelledby={HEADING_ID} sx={{ boxShadow: 3 }}>
      <Box
        sx={{
          px: compact ? 2.5 : 3,
          py: compact ? 1.5 : 2.25,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography id={HEADING_ID} variant="h6" component="h2">
            Trip details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {compact
              ? 'Geocoded via OpenStreetMap.'
              : "Locations are geocoded via OpenStreetMap. We'll match the closest known city."}
          </Typography>
        </Box>
        <Chip
          icon={<LocationOnRounded sx={{ fontSize: 14 }} />}
          label="3 stops"
          size="small"
          sx={{
            backgroundColor: 'primary.light',
            color: 'primary.dark',
          }}
        />
      </Box>
      <CardContent sx={{ p: compact ? 2.5 : 3 }}>
        <Stack
          component="form"
          spacing={compact ? 1.75 : 2.5}
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
            pin="start"
            letter="A"
            compact={compact}
          />
          <LocationField
            control={control}
            name="pickup"
            label="Pickup location"
            placeholder="Dallas, TX"
            disabled={isPending}
            pin="pickup"
            letter="B"
            compact={compact}
          />
          <LocationField
            control={control}
            name="dropoff"
            label="Drop-off location"
            placeholder="Atlanta, GA"
            disabled={isPending}
            pin="drop"
            letter="C"
            compact={compact}
          />

          <Controller
            name="cycle_used_hrs"
            control={control}
            render={({ field, fieldState }) => (
              <CycleGaugeField
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                disabled={isPending}
                compact={compact}
              />
            )}
          />

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1}
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              pt: compact ? 0.25 : 1,
            }}
          >
            <Button type="button" variant="text" disabled={isPending} onClick={handleResetClick}>
              Reset
            </Button>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              {onUseSample && (
                <Button
                  type="button"
                  variant="outlined"
                  disabled={isPending}
                  onClick={() => onUseSample(SAMPLE_TRIP_INPUT)}
                >
                  Use sample
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isPending}
                startIcon={
                  isPending
                    ? <CircularProgress size={18} color="inherit" />
                    : <AutoAwesomeRounded fontSize="small" />
                }
              >
                {isPending ? 'Planning…' : 'Plan trip'}
              </Button>
            </Stack>
          </Stack>
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
  pin: PinKind
  letter: string
  compact?: boolean
}

function LocationField({
  control,
  name,
  label,
  placeholder,
  disabled,
  autoFocus,
  pin,
  letter,
  compact,
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
          helperText={fieldState.error?.message ?? (compact ? '' : ' ')}
          autoComplete="off"
          autoFocus={autoFocus}
          required
          fullWidth
          size={compact ? 'small' : 'medium'}
          disabled={disabled}
          slotProps={{
            input: {
              startAdornment: <PinAdornment kind={pin} />,
              endAdornment: <LetterAdornment letter={letter} />,
            },
          }}
        />
      )}
    />
  )
}
