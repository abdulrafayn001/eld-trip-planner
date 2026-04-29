/**
 * <PlanPreview /> — right-side preview shown on the Plan-a-trip page after
 * the driver hits "Plan trip". Fetches the freshly created trip and lays
 * out the most useful at-a-glance info (compact stats + map + key stops),
 * with a "View full plan" CTA to navigate into the full trip detail.
 */
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded'
import HotelRounded from '@mui/icons-material/HotelRounded'
import RouteRounded from '@mui/icons-material/RouteRounded'
import { CompactStat, type CompactStatTone } from '@/components/CompactStat'
import { TripMap } from '@/components/TripMap'
import { useTrip } from '@/hooks/useTrip'
import { compactLocation, formatDuration } from '@/lib/format'
import type { Trip } from '@/lib/trip'
import { FONT_MONO } from '@/theme/theme'

interface PlanPreviewProps {
  tripId: string
}

export function PlanPreview({ tripId }: PlanPreviewProps) {
  const query = useTrip(tripId)

  if (query.isPending) return <PlanPreviewLoading />
  if (query.isError) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6">Could not load preview</Typography>
        <Typography variant="body2" color="text.secondary">
          {query.error.message}
        </Typography>
      </Card>
    )
  }

  return <PlanPreviewLoaded trip={query.data} />
}

export function PlanPreviewEmpty() {
  return (
    <Card
      sx={{
        p: 6,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1.75,
          backgroundColor: 'primary.light',
          color: 'primary.dark',
          display: 'grid',
          placeItems: 'center',
        }}
        aria-hidden
      >
        <RouteRounded sx={{ fontSize: 28 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>
          Route preview
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 360, mx: 'auto', lineHeight: 1.5 }}
        >
          Fill in the form and press <strong>Plan trip</strong> to see total miles,
          drive time, fuel stops, mandatory rests, and a daily log breakdown.
        </Typography>
      </Box>
    </Card>
  )
}

function PlanPreviewLoading() {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.25 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={68} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={170} />
      <Skeleton variant="rounded" height={140} />
    </Stack>
  )
}

function PlanPreviewLoaded({ trip }: { trip: Trip }) {
  const drivingHours = trip.logs.reduce((acc, log) => acc + log.total_driving, 0)
  const restCount = trip.events.filter((e) => e.activity === '10-hr daily reset').length

  const stops = pickPreviewStops(trip)

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.25 }}>
        <CompactStat
          icon={RouteRounded}
          label="Distance"
          value={Math.round(trip.total_distance_mi).toLocaleString()}
          unit="mi"
        />
        <CompactStat
          icon={AccessTimeRounded}
          label="Drive time"
          value={formatDuration(drivingHours)}
          tone="amber"
        />
        <CompactStat
          icon={CalendarTodayRounded}
          label="Days"
          value={trip.logs.length}
          unit="d"
        />
        <CompactStat
          icon={HotelRounded}
          label="Rests"
          value={restCount}
          unit="× 10h"
          tone="green"
        />
      </Box>

      <Box sx={{ borderRadius: 1.5, overflow: 'hidden', boxShadow: 1 }}>
        <Box sx={{ height: 170 }}>
          <TripMap trip={trip} compact />
        </Box>
      </Box>

      <Card>
        <Stack sx={{ px: 1, py: 0.75 }}>
          {stops.map((stop, i) => (
            <PreviewStop key={`${stop.kind}-${i}`} stop={stop} last={i === stops.length - 1} />
          ))}
        </Stack>
      </Card>

      <Stack
        direction="row"
        sx={{ justifyContent: 'flex-end', alignItems: 'center', pt: 0.5 }}
      >
        <Button
          component={RouterLink}
          to={`/trip/${trip.id}`}
          variant="contained"
          endIcon={<ArrowForwardRounded fontSize="small" />}
        >
          View full plan
        </Button>
      </Stack>
    </Stack>
  )
}

interface PreviewStopData {
  time: string
  date: string
  kind: 'start' | 'pickup' | 'drop'
  name: string
  sub: string
}

function PreviewStop({ stop, last }: { stop: PreviewStopData; last: boolean }) {
  const palette: Record<PreviewStopData['kind'], { bg: string; tone: CompactStatTone }> = {
    start: { bg: 'text.primary', tone: 'primary' },
    pickup: { bg: 'secondary.main', tone: 'amber' },
    drop: { bg: 'primary.main', tone: 'primary' },
  }
  const tone = palette[stop.kind]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '64px 28px 1fr',
        gap: 1.5,
        px: 1.25,
        py: 1,
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {!last && (
        <Box
          sx={{
            position: 'absolute',
            left: 64 + 12 + 13,
            top: 38,
            bottom: -8,
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
            fontSize: 13,
            color: 'text.primary',
          }}
        >
          {stop.time}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {stop.date}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: tone.bg,
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          zIndex: 1,
          fontSize: 13,
        }}
        aria-hidden
      >
        {stop.kind === 'start' ? 'A' : stop.kind === 'pickup' ? 'B' : 'C'}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{stop.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {stop.sub}
        </Typography>
      </Box>
    </Box>
  )
}

function pickPreviewStops(trip: Trip): PreviewStopData[] {
  const start = trip.events[0]
  const pickup = trip.events.find((e) => e.activity === 'Pickup')
  const drop = trip.events.find((e) => e.activity === 'Drop-off')
  const out: PreviewStopData[] = []
  if (start) {
    out.push({
      time: timeOf(start.start_time),
      date: dateOf(start.start_time),
      kind: 'start',
      name: compactLocation(start.location_label) || trip.current_location,
      sub: 'Origin · pre-trip',
    })
  }
  if (pickup) {
    out.push({
      time: timeOf(pickup.start_time),
      date: dateOf(pickup.start_time),
      kind: 'pickup',
      name: `${compactLocation(pickup.location_label) || trip.pickup_location} · Pickup`,
      sub: `${Math.round(trip.total_distance_mi / 2).toLocaleString()} mi from origin`,
    })
  }
  if (drop) {
    out.push({
      time: timeOf(drop.start_time),
      date: dateOf(drop.start_time),
      kind: 'drop',
      name: `${compactLocation(drop.location_label) || trip.dropoff_location} · Drop-off`,
      sub: `${trip.logs.length} ${trip.logs.length === 1 ? 'log' : 'logs'} · ${formatDuration(trip.total_duration_hr)} total`,
    })
  }
  return out
}

function timeOf(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function dateOf(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
