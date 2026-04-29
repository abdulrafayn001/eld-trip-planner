/**
 * <TripItineraryTrack /> — "key stops" timeline derived from TripEvents.
 *
 * Two layouts:
 * - `horizontal` (default): pip-track laid out left → right under the map.
 *   Picks a digestible subset of events (origin, pickup, drop-off, plus a
 *   handful of rests/fuels between).
 * - `vertical`: full event list inside a sidebar card. Renders every
 *   non-driving event as a row with mono time/date + colored pip + name.
 */
import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import FreeBreakfast from '@mui/icons-material/FreeBreakfast'
import Hotel from '@mui/icons-material/Hotel'
import Inventory2Rounded from '@mui/icons-material/Inventory2Rounded'
import LocalGasStation from '@mui/icons-material/LocalGasStation'
import OutlinedFlag from '@mui/icons-material/OutlinedFlag'
import Place from '@mui/icons-material/Place'
import Restore from '@mui/icons-material/Restore'
import { compactLocation, formatTime } from '@/lib/format'
import { paletteFor, type StopPaletteEntry } from '@/lib/stopPalette'
import type { TripEvent } from '@/lib/trip'
import { FONT_MONO } from '@/theme/theme'

interface Stop {
  key: string
  icon: ComponentType<SvgIconProps>
  name: string
  time: string
  date?: string
  palette: StopPaletteEntry
}

const ICON_BY_ACTIVITY: Record<string, ComponentType<SvgIconProps>> = {
  'Pre-trip inspection': OutlinedFlag,
  'Post-trip inspection': Place,
  Pickup: Inventory2Rounded,
  'Drop-off': Place,
  '30-min break': FreeBreakfast,
  Fueling: LocalGasStation,
  '10-hr daily reset': Hotel,
  '34-hr restart': Restore,
}

const NON_DRIVING_ACTIVITIES = new Set([
  'Pre-trip inspection',
  'Post-trip inspection',
  'Pickup',
  'Drop-off',
  '30-min break',
  'Fueling',
  '10-hr daily reset',
  '34-hr restart',
])

function pickHorizontal(events: TripEvent[]): Stop[] {
  const out: Stop[] = []
  const addFirstByActivity = (activity: string) => {
    const e = events.find((x) => x.activity === activity)
    if (!e) return
    out.push({
      key: `${activity}-${e.sequence}`,
      icon: ICON_BY_ACTIVITY[activity] ?? Place,
      name: `${activity}${e.location_label ? ` · ${compactLocation(e.location_label)}` : ''}`,
      time: formatTime(e.start_time),
      palette: paletteFor(activity),
    })
  }

  const origin = events[0]
  if (origin) {
    out.push({
      key: `origin-${origin.sequence}`,
      icon: OutlinedFlag,
      name: compactLocation(origin.location_label) || 'Origin',
      time: formatTime(origin.start_time),
      palette: paletteFor('Pre-trip inspection'),
    })
  }

  const middle = events
    .filter((e) =>
      ['10-hr daily reset', '30-min break', 'Fueling', '34-hr restart'].includes(e.activity),
    )
    .slice(0, 4)
  for (const e of middle) {
    out.push({
      key: `${e.activity}-${e.sequence}`,
      icon: ICON_BY_ACTIVITY[e.activity] ?? Place,
      name: `${e.activity}${e.location_label ? ` · ${compactLocation(e.location_label)}` : ''}`,
      time: formatTime(e.start_time),
      palette: paletteFor(e.activity),
    })
  }

  addFirstByActivity('Pickup')
  addFirstByActivity('Drop-off')

  return out
}

function pickVertical(events: TripEvent[]): Stop[] {
  return events
    .filter((e) => NON_DRIVING_ACTIVITIES.has(e.activity))
    .map((e) => ({
      key: `${e.activity}-${e.sequence}`,
      icon: ICON_BY_ACTIVITY[e.activity] ?? Place,
      name: `${e.activity}${e.location_label ? ` · ${compactLocation(e.location_label)}` : ''}`,
      time: formatTime(e.start_time),
      date: dateOf(e.start_time),
      palette: paletteFor(e.activity),
    }))
}

function dateOf(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface TripItineraryTrackProps {
  events: TripEvent[]
  variant?: 'horizontal' | 'vertical'
}

export function TripItineraryTrack({
  events,
  variant = 'horizontal',
}: TripItineraryTrackProps) {
  if (variant === 'vertical') {
    return <VerticalItinerary stops={pickVertical(events)} />
  }
  return <HorizontalItinerary stops={pickHorizontal(events)} />
}

function HorizontalItinerary({ stops }: { stops: Stop[] }) {
  if (stops.length === 0) return null
  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 2.25,
        }}
      >
        Itinerary · key stops
      </Typography>
      <Stack
        direction="row"
        sx={{
          position: 'relative',
          overflowX: 'auto',
          pb: 1.5,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 22,
            height: 2,
            backgroundColor: 'divider',
            borderRadius: 1,
          },
        }}
      >
        {stops.map((stop) => {
          const Icon = stop.icon
          return (
            <Box
              key={stop.key}
              sx={{
                flex: 1,
                minWidth: 110,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                px: 0.75,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: stop.palette.fill,
                  color: stop.palette.on,
                  border: '2px solid',
                  borderColor: stop.palette.border,
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: 1,
                }}
                aria-hidden
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                component="div"
                sx={{
                  mt: 1.25,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {stop.name}
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: 'text.secondary',
                  mt: 0.25,
                  letterSpacing: '0.02em',
                }}
              >
                {stop.time}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

function VerticalItinerary({ stops }: { stops: Stop[] }) {
  if (stops.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          No stops scheduled.
        </Typography>
      </Box>
    )
  }
  return (
    <Box sx={{ px: 1, py: 0.75 }}>
      {stops.map((stop, i) => {
        const Icon = stop.icon
        const last = i === stops.length - 1
        return (
          <Box
            key={stop.key}
            sx={{
              display: 'grid',
              gridTemplateColumns: '54px 24px 1fr',
              gap: 1.25,
              px: 1.25,
              py: 0.875,
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {!last && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 54 + 10 + 11,
                  top: 32,
                  bottom: -7,
                  width: 2,
                  backgroundColor: 'divider',
                }}
                aria-hidden
              />
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                lineHeight: 1.1,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: FONT_MONO,
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'text.primary',
                }}
              >
                {stop.time}
              </Typography>
              {stop.date && (
                <Typography
                  component="span"
                  sx={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {stop.date}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: stop.palette.fill,
                color: stop.palette.on,
                border: '2px solid',
                borderColor: stop.palette.border,
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
              aria-hidden
            >
              <Icon sx={{ fontSize: 13 }} />
            </Box>
            <Typography
              component="span"
              sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}
            >
              {stop.name}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
