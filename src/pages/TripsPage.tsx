import { useCallback, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import LocalShipping from '@mui/icons-material/LocalShipping'
import RouteRounded from '@mui/icons-material/RouteRounded'
import {
  CompactStat,
  type CompactStatTone,
} from '@/components/CompactStat'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { InfiniteScrollSentinel } from '@/components/InfiniteScrollSentinel'
import { useDeleteTrip } from '@/hooks/useDeleteTrip'
import { useTrips } from '@/hooks/useTrips'
import { loadLastTripInput } from '@/lib/tripInput'
import type { TripSummary } from '@/lib/trip'
import { FONT_MONO } from '@/theme/theme'
import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'

interface TripKpi {
  icon: ComponentType<SvgIconProps>
  label: string
  value: string | number
  unit?: string
  sub?: string
  tone?: CompactStatTone
}

export default function TripsPage() {
  const query = useTrips()
  const trips = useMemo<TripSummary[]>(
    () => query.data?.pages.flatMap((page) => page.results) ?? [],
    [query.data],
  )
  const totalCount = query.data?.pages[0]?.count
  const stats = useMemo(
    () => buildStats(trips, totalCount),
    [trips, totalCount],
  )

  const handleLoadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage()
    }
  }, [query])

  return (
    <Container maxWidth="lg" component="main">
      <Box sx={{ py: { xs: 3, sm: 4 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', sm: 'flex-end' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ mb: 0.25 }}>
                Trips
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Every route you&apos;ve planned, newest first
                {totalCount !== undefined ? ` · ${totalCount} total` : ''}.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/plan"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}
            >
              Plan a trip
            </Button>
          </Stack>

          {query.isSuccess && trips.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: 1.5,
              }}
            >
              {stats.map((stat) => (
                <CompactStat key={stat.label} {...stat} />
              ))}
            </Box>
          )}

          <Typography
            component="h2"
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Recent trips
          </Typography>

          {query.isPending && <TripsSkeleton />}
          {query.isError && (
            <TripsError
              message={query.error.message}
              onRetry={() => void query.refetch()}
            />
          )}
          {query.isSuccess && trips.length === 0 && <TripsEmpty />}
          {query.isSuccess && trips.length > 0 && (
            <>
              <Grid container spacing={1.75}>
                {trips.map((trip) => (
                  <Grid key={trip.id} size={{ xs: 12, sm: 6 }}>
                    <TripCard trip={trip} />
                  </Grid>
                ))}
              </Grid>
              {query.hasNextPage && (
                <InfiniteScrollSentinel
                  onIntersect={handleLoadMore}
                  disabled={query.isFetchingNextPage}
                />
              )}
              {query.isFetchingNextPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}
        </Stack>
      </Box>
    </Container>
  )
}

function buildStats(trips: TripSummary[], totalCount: number | undefined): TripKpi[] {
  // Aggregates run over loaded pages only; the total trip count comes from
  // the paginated response so it stays accurate even before the user has
  // scrolled to the end.
  const totalMiles = trips.reduce((acc, t) => acc + t.total_distance_mi, 0)
  const restartCount = trips.filter((t) => t.requires_34h_restart).length
  const compliance = trips.length === 0
    ? '—'
    : restartCount === 0
      ? '100%'
      : `${Math.round(((trips.length - restartCount) / trips.length) * 100)}%`
  const cycleUsed = loadLastTripInput()?.cycle_used_hrs ?? 0
  const cycleRemaining = Math.max(0, 70 - cycleUsed)
  const tripsTotal = totalCount ?? trips.length
  return [
    {
      label: 'Total miles',
      value: Math.round(totalMiles).toLocaleString(),
      unit: 'mi',
      sub: `Across ${trips.length} loaded ${trips.length === 1 ? 'trip' : 'trips'}`,
      icon: RouteRounded,
      tone: 'primary',
    },
    {
      label: 'Trips planned',
      value: tripsTotal,
      sub: restartCount > 0 ? `${restartCount} need 34h restart` : 'Newest first',
      icon: CalendarTodayRounded,
      tone: 'primary',
    },
    {
      label: 'Cycle used',
      value: cycleUsed.toFixed(1),
      unit: 'hr',
      sub: `${cycleRemaining.toFixed(1)} hr remaining`,
      icon: AccessTimeRounded,
      tone: 'amber',
    },
    {
      label: 'Compliance',
      value: compliance,
      sub: restartCount === 0 ? 'No HOS violations' : `${restartCount} flagged`,
      icon: AutoAwesomeRounded,
      tone: restartCount === 0 ? 'green' : 'amber',
    },
  ]
}

function shortTripId(id: string): string {
  const tail = id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase()
  return `TR-${tail.padStart(4, '0')}`
}

function TripCard({ trip }: { trip: TripSummary }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteMutation = useDeleteTrip()

  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        boxShadow: 1,
        overflow: 'hidden',
        transition: 'box-shadow 200ms, transform 200ms',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <Tooltip title="Delete trip">
        <IconButton
          aria-label="Delete trip"
          size="small"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setConfirmOpen(true)
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'error.main', color: 'common.white' },
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <CardActionArea
        component={RouterLink}
        to={`/trip/${trip.id}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pl: 2.25,
            pr: 6,
            py: 1.25,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography
              component="div"
              sx={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: 'text.secondary',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {formatDate(trip.created_at)}
            </Typography>
            <Typography
              component="div"
              sx={{
                fontFamily: FONT_MONO,
                fontSize: 13,
                color: 'text.primary',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {shortTripId(trip.id)}
            </Typography>
          </Box>
          {trip.requires_34h_restart ? (
            <Chip size="small" color="warning" label="34h restart" />
          ) : (
            <Chip
              size="small"
              label="On schedule"
              sx={{ backgroundColor: 'success.light', color: 'success.main' }}
            />
          )}
        </Box>

        <CardContent sx={{ flex: 1, px: 2.25, py: 1.5, '&:last-child': { pb: 1.25 } }}>
          <Box sx={{ position: 'relative', pl: 2.5 }}>
            <Box
              sx={{
                position: 'absolute',
                left: 6,
                top: 12,
                bottom: 12,
                width: 2,
                background: (theme) =>
                  `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                borderRadius: 1,
              }}
              aria-hidden
            />
            <Stack spacing={1}>
              <ODRow kind="pickup" label="Pickup" text={trip.pickup_location} />
              <ODRow kind="drop" label="Drop-off" text={trip.dropoff_location} />
            </Stack>
          </Box>
        </CardContent>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            px: 2.25,
            py: 1.25,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
          }}
        >
          <Stat label="Distance" value={`${formatMiles(trip.total_distance_mi)} mi`} />
          <Stat label="Drive" value={`${formatHours(trip.total_duration_hr)} hr`} />
        </Box>
      </CardActionArea>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this trip?"
        description="This permanently removes the trip along with its events and daily logs. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteMutation.mutate(trip.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
      />
    </Card>
  )
}

function ODRow({ kind, label, text }: { kind: 'pickup' | 'drop'; label: string; text: string }) {
  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          flexShrink: 0,
          ml: '-1.25rem',
          mr: 0.5,
          border: '3px solid',
          borderColor: 'background.paper',
          ...(kind === 'pickup'
            ? {
                backgroundColor: 'secondary.main',
                boxShadow: (theme) => `0 0 0 1px ${theme.palette.secondary.main}`,
              }
            : {
                backgroundColor: 'primary.main',
                boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
              }),
        }}
        aria-hidden
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="div"
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
        <Typography
          component="div"
          sx={{
            fontWeight: 500,
            fontSize: 14,
            color: 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {text}
        </Typography>
      </Box>
    </Stack>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        component="div"
        sx={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{
          fontFamily: FONT_MONO,
          fontSize: 14,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: 'text.primary',
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

function TripsSkeleton() {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="80%" />
                <Stack direction="row" spacing={1}>
                  <Skeleton variant="rounded" width={64} height={24} />
                  <Skeleton variant="rounded" width={64} height={24} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

function TripsEmpty() {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        boxShadow: 0,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? `radial-gradient(circle at 0% 0%, rgba(30,106,232,0.08), transparent 55%),
               radial-gradient(circle at 100% 100%, rgba(245,158,11,0.06), transparent 55%),
               ${theme.palette.background.paper}`
            : `radial-gradient(circle at 0% 0%, rgba(30,106,232,0.18), transparent 55%),
               radial-gradient(circle at 100% 100%, rgba(245,158,11,0.10), transparent 55%),
               ${theme.palette.background.paper}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: (theme) =>
            theme.palette.mode === 'light'
              ? 'radial-gradient(rgba(15,42,86,0.08) 1px, transparent 1px)'
              : 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.7), transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.7), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Stack
        spacing={3}
        sx={{
          position: 'relative',
          alignItems: 'center',
          textAlign: 'center',
          py: { xs: 5, sm: 7 },
          px: { xs: 3, sm: 5 },
        }}
      >
        <RouteIllustration />
        <Box sx={{ maxWidth: 420 }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, letterSpacing: '-0.01em', mb: 1 }}
          >
            No trips yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            Plan your first route to see total miles, drive time, mandatory rests,
            and a daily log breakdown right here.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/plan"
          variant="contained"
          size="large"
          startIcon={<AddRoundedIcon />}
          sx={{
            px: 3,
            background: 'linear-gradient(135deg, #1E6AE8 0%, #134397 100%)',
            boxShadow: '0 6px 18px rgba(30,106,232,0.32)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1A5FD1 0%, #0F3675 100%)',
              boxShadow: '0 8px 22px rgba(30,106,232,0.42)',
            },
          }}
        >
          Plan a trip
        </Button>
        <Typography
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: 'text.secondary',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Tip · Routes save automatically the moment they&apos;re planned
        </Typography>
      </Stack>
    </Card>
  )
}

function RouteIllustration() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
      }}
    >
      <Waypoint kind="pickup" label="Pickup" />
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          mx: 1.5,
          height: 2,
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1E6AE8 0%, #134397 100%)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 24px rgba(30,106,232,0.38)',
          }}
        >
          <LocalShipping sx={{ fontSize: 24 }} />
        </Box>
      </Box>
      <Waypoint kind="drop" label="Drop-off" />
    </Box>
  )
}

function Waypoint({ kind, label }: { kind: 'pickup' | 'drop'; label: string }) {
  return (
    <Stack sx={{ alignItems: 'center', gap: 0.75 }}>
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '4px solid',
          borderColor: 'background.paper',
          ...(kind === 'pickup'
            ? {
                backgroundColor: 'secondary.main',
                boxShadow: (theme) =>
                  `0 0 0 2px ${theme.palette.secondary.main}, 0 6px 14px ${theme.palette.secondary.main}55`,
              }
            : {
                backgroundColor: 'primary.main',
                boxShadow: (theme) =>
                  `0 0 0 2px ${theme.palette.primary.main}, 0 6px 14px ${theme.palette.primary.main}55`,
              }),
        }}
      />
      <Typography
        sx={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
    </Stack>
  )
}

function TripsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Could not load trips</Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
          <Button variant="outlined" onClick={onRetry}>
            Try again
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatMiles(value: number): string {
  return Math.round(value).toLocaleString()
}

function formatHours(value: number): string {
  return value.toFixed(1)
}
