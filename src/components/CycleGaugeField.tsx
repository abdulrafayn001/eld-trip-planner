/**
 * <CycleGaugeField /> — visual gauge surface used as the cycle-hours input
 * on the plan-a-trip form. Wraps a numeric input so the form keeps its
 * RHF/Zod-validated value while the driver gets a meaningful readout of
 * "hours used / 70" + remaining-hours footer.
 */
import { forwardRef, useId, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FONT_MONO } from '@/theme/theme'

interface CycleGaugeFieldProps {
  value: number
  onChange: (next: number) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  max?: number
  /** Tighter padding + smaller numeric label so the gauge fits a 480px form column. */
  compact?: boolean
}

export const CycleGaugeField = forwardRef<HTMLInputElement, CycleGaugeFieldProps>(
  function CycleGaugeField(
    { value, onChange, onBlur, error, disabled, max = 70, compact = false },
    ref,
  ) {
    const fieldId = useId()
    const [sliding, setSliding] = useState(false)
    const valid = Number.isFinite(value)
    const safe = valid ? Math.min(Math.max(value, 0), max) : 0
    const remaining = max - safe
    const warn = remaining < 14
    const numericLabel = valid ? safe.toFixed(1) : '0.0'

    return (
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            component="label"
            htmlFor={fieldId}
            sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}
          >
            Cycle used
          </Typography>
          <Chip
            label={`0 – ${max} hrs · 8-day window`}
            size="small"
            sx={{ backgroundColor: 'action.hover', color: 'text.secondary' }}
          />
        </Stack>

        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
            borderRadius: 1,
            p: compact ? 1.5 : { xs: 2, sm: 2.25 },
            border: 1,
            borderColor: error ? 'error.main' : 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: compact ? 1 : 1.5,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5 }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
              <Typography
                component="label"
                htmlFor={fieldId}
                sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}
              >
                Hours already on duty
              </Typography>
              <Box
                component="input"
                ref={ref}
                id={fieldId}
                type="number"
                inputMode="decimal"
                step={0.1}
                min={0}
                max={max}
                value={valid ? safe : ''}
                onChange={(e) => {
                  const v = e.target.value
                  onChange(v === '' ? Number.NaN : Number(v))
                }}
                onBlur={onBlur}
                disabled={disabled}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                sx={{
                  width: 84,
                  height: 36,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 1,
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  colorScheme: (theme) => theme.palette.mode,
                  visibility: sliding ? 'hidden' : 'visible',
                  '&:focus': {
                    outline: 'none',
                    borderColor: 'primary.main',
                    boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}`,
                  },
                }}
              />
            </Stack>
            <Typography
              component="span"
              sx={{
                fontFamily: FONT_MONO,
                fontSize: compact ? 20 : 28,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
                color: 'text.primary',
                lineHeight: 1.1,
              }}
            >
              {numericLabel}
              <Box
                component="span"
                sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 400, ml: 0.5 }}
              >
                / {max} hr
              </Box>
            </Typography>
          </Stack>

          <Slider
            value={safe}
            min={0}
            max={max}
            step={0.5}
            disabled={disabled}
            onChange={(_, next) => {
              setSliding(true)
              onChange(typeof next === 'number' ? next : next[0])
            }}
            onChangeCommitted={() => setSliding(false)}
            onBlur={onBlur}
            aria-label="Hours already on duty"
            sx={{
              py: 1,
              color: warn ? 'warning.main' : 'primary.main',
              '& .MuiSlider-rail': {
                height: 8,
                backgroundColor: 'rgba(30,106,232,0.10)',
                opacity: 1,
                border: 'none',
              },
              '& .MuiSlider-track': {
                height: 8,
                border: 'none',
                background: warn
                  ? 'linear-gradient(90deg, #C77B14 0%, #E8A33E 100%)'
                  : 'linear-gradient(90deg, #1E6AE8 0%, #4C8DF5 100%)',
                transition: 'width 200ms ease',
              },
              '& .MuiSlider-thumb': {
                width: 18,
                height: 18,
                backgroundColor: 'background.paper',
                border: '2px solid',
                borderColor: warn ? 'warning.main' : 'primary.main',
                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0 0 0 8px ${warn ? 'rgba(199,123,20,0.16)' : 'rgba(30,106,232,0.16)'}`,
                },
                '&.Mui-active': {
                  boxShadow: `0 0 0 12px ${warn ? 'rgba(199,123,20,0.20)' : 'rgba(30,106,232,0.20)'}`,
                },
              },
            }}
          />

          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: 'text.secondary',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            <Box component="span">0 HR</Box>
            <Box
              component="span"
              sx={{ color: warn ? 'warning.main' : 'success.main', fontWeight: 600 }}
            >
              {remaining.toFixed(1)} HR REMAINING
            </Box>
            <Box component="span">{max} HR</Box>
          </Stack>
        </Box>
        {error && (
          <Typography
            id={`${fieldId}-error`}
            variant="caption"
            color="error"
            sx={{ ml: 1.75 }}
          >
            {error}
          </Typography>
        )}
      </Stack>
    )
  },
)
