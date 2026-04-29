/**
 * <CompactStat /> — denser version of the stat tile used on the Plan
 * preview pane and the Trips/Trip detail KPI strips. ~70px tall, single
 * tinted icon + small mono label + tabular-nums value (+ optional unit
 * and sub line). Drop-in for tight 4-up grids.
 */
import type { ComponentType, ReactNode } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FONT_MONO } from '@/theme/theme'

export type CompactStatTone = 'primary' | 'amber' | 'green'

interface CompactStatProps {
  icon: ComponentType<SvgIconProps>
  label: string
  value: ReactNode
  unit?: string
  sub?: ReactNode
  tone?: CompactStatTone
}

const TONE_STYLES: Record<CompactStatTone, { bg: string; color: string }> = {
  primary: { bg: 'primary.light', color: 'primary.dark' },
  amber: { bg: 'warning.light', color: 'warning.main' },
  green: { bg: 'success.light', color: 'success.main' },
}

export function CompactStat({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  tone = 'primary',
}: CompactStatProps) {
  const t = TONE_STYLES[tone]
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        boxShadow: 1,
        px: 1.75,
        py: 1.25,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        minWidth: 0,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '6px',
            backgroundColor: t.bg,
            color: t.color,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <Icon sx={{ fontSize: 14 }} />
        </Box>
        <Typography
          component="span"
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        component="span"
        sx={{
          fontSize: 22,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          color: 'text.primary',
          lineHeight: 1.05,
        }}
      >
        {value}
        {unit && (
          <Box
            component="span"
            sx={{
              fontSize: 11,
              color: 'text.secondary',
              fontWeight: 400,
              ml: 0.5,
            }}
          >
            {unit}
          </Box>
        )}
      </Typography>
      {sub && (
        <Typography
          component="span"
          sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.3 }}
        >
          {sub}
        </Typography>
      )}
    </Box>
  )
}
