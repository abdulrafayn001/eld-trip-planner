import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useTrips } from '@/hooks/useTrips'
import type { TripSummary } from '@/lib/trip'

export default function TripsPage() {
  const query = useTrips()

  return (
    <Container maxWidth="lg" component="main">
      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                My trips
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Every route you&apos;ve planned, newest first.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              Plan a trip
            </Button>
          </Stack>

          {query.isPending && <TripsSkeleton />}
          {query.isError && (
            <TripsError
              message={query.error.message}
              onRetry={() => void query.refetch()}
            />
          )}
          {query.isSuccess && query.data.length === 0 && <TripsEmpty />}
          {query.isSuccess && query.data.length > 0 && (
            <Grid container spacing={2}>
              {query.data.map((trip) => (
                <Grid key={trip.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <TripCard trip={trip} />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Box>
    </Container>
  )
}

function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea
        component={RouterLink}
        to={`/trip/${trip.id}`}
        sx={{ height: '100%' }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(trip.created_at)}
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Pickup
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {trip.pickup_location}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Drop-off
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {trip.dropoff_location}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                size="small"
                label={`${formatMiles(trip.total_distance_mi)} mi`}
              />
              <Chip
                size="small"
                label={`${formatHours(trip.total_duration_hr)} hr`}
              />
              {trip.requires_34h_restart && (
                <Chip size="small" color="warning" label="34h restart" />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function TripsSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
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
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No trips yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Plan your first route to see it listed here.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            startIcon={<AddRoundedIcon />}
          >
            Plan a trip
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

function TripsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card variant="outlined">
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
