import type { ComponentType } from 'react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import RouteRounded from '@mui/icons-material/RouteRounded'
import { CompactLogRow } from '@/components/CompactLogRow'
import { CompactStat, type CompactStatTone } from '@/components/CompactStat'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  DailyLogSheet,
  type DailyLogSheetCumulative,
} from '@/components/DailyLogSheet'
import { LogViewToggle, type LogView } from '@/components/LogViewToggle'
import { ModernLogCard } from '@/components/ModernLogCard'
import { TripItineraryTrack } from '@/components/TripItineraryTrack'
import { TripMap } from '@/components/TripMap'
import { TripPageError } from '@/components/TripPageError'
import { TripPageSkeleton } from '@/components/TripPageSkeleton'
import { useDeleteTrip } from '@/hooks/useDeleteTrip'
import { useTrip } from '@/hooks/useTrip'
import { formatDuration } from '@/lib/format'
import type { DailyLog, Trip } from '@/lib/trip'

interface TripKpi {
  icon: ComponentType<SvgIconProps>
  label: string
  value: string | number
  unit?: string
  sub?: string
  tone?: CompactStatTone
}

export default function TripPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const query = useTrip(id)
  const [logView, setLogView] = useState<LogView>('modern')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteMutation = useDeleteTrip()

  // Cumulative on-duty hours per log date — within this trip only, since
  // we don't have prior 7/8/5-day history. Walks logs once and folds the
  // running total; passed into each <DailyLogSheet>'s recap band.
  const cumulativeByDate = useMemo<Record<string, DailyLogSheetCumulative>>(() => {
    const logs = query.data?.logs ?? []
    return buildCumulativeByDate(logs)
  }, [query.data?.logs])

  const stats = useMemo<TripKpi[]>(() => {
    if (!query.data) return []
    return buildStats(query.data)
  }, [query.data])

  const handleRetry = () => {
    void query.refetch()
  }

  const handlePrint = () => {
    window.print()
  }

  let content: ReactNode
  if (query.isPending) {
    content = <TripPageSkeleton />
  } else if (query.isError) {
    content = <TripPageError message={query.error.message} onRetry={handleRetry} />
  } else {
    const trip = query.data
    const hasLogs = trip.logs.length > 0
    const tripIdShort = shortTripId(trip.id)
    const dateRange = formatDateRange(trip.logs)
    content = (
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', md: 'flex-end' },
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Box
              sx={{
                fontSize: 12,
                color: 'text.secondary',
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Box
                component={RouterLink}
                to="/"
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.dark' } }}
              >
                Trips
              </Box>
              <Box component="span" sx={{ color: 'text.disabled' }}>/</Box>
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                {tripIdShort}
              </Box>
            </Box>
            <Typography variant="h4" component="h1" sx={{ mb: 0.25 }}>
              {trip.current_location} → {trip.pickup_location} → {trip.dropoff_location}
            </Typography>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                {hasLogs ? `${trip.logs.length} daily ${trip.logs.length === 1 ? 'log' : 'logs'}` : 'Plan in progress'}
                {dateRange ? ` · ${dateRange}` : ''}
              </Typography>
              {trip.requires_34h_restart ? (
                <Chip size="small" color="warning" label="34h restart" />
              ) : (
                <Chip
                  size="small"
                  label="HOS compliant"
                  sx={{ backgroundColor: 'success.light', color: 'success.main' }}
                />
              )}
            </Stack>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => setConfirmOpen(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadRounded />}
              disabled={!hasLogs}
              sx={{ whiteSpace: 'nowrap' }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Export&nbsp;
              </Box>
              PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintRoundedIcon />}
              onClick={handlePrint}
              disabled={!hasLogs}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Print
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                &nbsp;all logs
              </Box>
            </Button>
          </Stack>
        </Stack>

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

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <Card sx={{ overflow: 'hidden', height: { xs: 360, md: 480 } }}>
            <Box sx={{ height: '100%', width: '100%' }}>
              <TripMap trip={trip} compact />
            </Box>
          </Card>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: { xs: 'auto', md: 480 },
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box>
                <Typography component="h2" sx={{ fontSize: 14, fontWeight: 600 }}>
                  Itinerary
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {trip.events.length} stops
                </Typography>
              </Box>
              <Chip size="small" label="Auto-scheduled" />
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <TripItineraryTrack events={trip.events} variant="vertical" />
            </Box>
          </Card>
        </Box>

        {hasLogs && (
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography component="h2" variant="h6" sx={{ mb: 0.25 }}>
                  Daily logs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  FMCSA-compliant 24-hour duty grids · one per calendar day.
                </Typography>
              </Box>
              <LogViewToggle value={logView} onChange={setLogView} />
            </Stack>

            {logView === 'modern' && (
              <Stack spacing={2}>
                {trip.logs.map((log, i) => {
                  const cum = cumulativeByDate[log.date]
                  return (
                    <ModernLogCard
                      key={log.date}
                      log={log}
                      index={i}
                      total={trip.logs.length}
                      onDutyLast7Days={cum?.onDutyLast7Days}
                      onDutyLast8Days={cum?.onDutyLast8Days}
                      onDutyLast5Days={cum?.onDutyLast5Days}
                    />
                  )
                })}
              </Stack>
            )}

            {logView === 'compact' && (
              <Stack spacing={1}>
                {trip.logs.map((log, i) => (
                  <CompactLogRow
                    key={log.date}
                    log={log}
                    index={i}
                    total={trip.logs.length}
                  />
                ))}
              </Stack>
            )}

            {logView === 'classic' && (
              <Stack spacing={2}>
                {trip.logs.map((log) => (
                  <DailyLogSheet
                    key={log.date}
                    log={log}
                    cumulative={cumulativeByDate[log.date]}
                    requires34hRestart={trip.requires_34h_restart}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    )
  }

  return (
    <Container maxWidth="lg" component="main">
      <Box sx={{ py: { xs: 3, sm: 4 } }}>{content}</Box>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this trip?"
        description="This permanently removes the trip along with its events and daily logs. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteMutation.mutate(id, {
            onSuccess: () => {
              setConfirmOpen(false)
              void navigate('/')
            },
          })
        }
      />
    </Container>
  )
}

function buildStats(trip: Trip): TripKpi[] {
  const drivingHours = trip.logs.reduce((acc, log) => acc + log.total_driving, 0)
  return [
    {
      label: 'Distance',
      value: Math.round(trip.total_distance_mi).toLocaleString(),
      unit: 'mi',
      sub: 'OSRM highway routing',
      icon: RouteRounded,
      tone: 'primary',
    },
    {
      label: 'Total time',
      value: formatDuration(trip.total_duration_hr),
      sub: 'Including rests',
      icon: AccessTimeRounded,
      tone: 'primary',
    },
    {
      label: 'Driving',
      value: formatDuration(drivingHours),
      sub: 'Avg 60 mph',
      icon: LocalShippingRounded,
      tone: 'amber',
    },
    {
      label: 'Log days',
      value: trip.logs.length,
      unit: trip.logs.length === 1 ? 'day' : 'days',
      sub: formatDateRange(trip.logs) || '—',
      icon: CalendarTodayRounded,
      tone: 'green',
    },
  ]
}

function buildCumulativeByDate(logs: DailyLog[]): Record<string, DailyLogSheetCumulative> {
  const map: Record<string, DailyLogSheetCumulative> = {}
  let runningOnDuty = 0
  for (const log of logs) {
    runningOnDuty += log.total_driving + log.total_on_duty
    map[log.date] = {
      onDutyLast7Days: runningOnDuty,
      onDutyLast8Days: runningOnDuty,
      onDutyLast5Days: runningOnDuty,
    }
  }
  return map
}

function formatDateRange(logs: DailyLog[]): string | null {
  if (logs.length === 0) return null
  const first = formatLogDate(logs[0].date)
  if (logs.length === 1) return first
  const last = formatLogDate(logs[logs.length - 1].date)
  return `${first} → ${last}`
}

function formatLogDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function shortTripId(id: string): string {
  const tail = id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase()
  return `TR-${tail.padStart(4, '0')}`
}
