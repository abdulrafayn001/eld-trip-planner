import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import RestoreRounded from '@mui/icons-material/RestoreRounded'
import { formatDuration, formatLogDays, formatMiles } from '@/lib/format'
import type { Trip } from '@/lib/trip'

interface TripSummaryProps {
  trip: Trip
}

const HEADING_ID = 'trip-summary-heading'

export function TripSummary({ trip }: TripSummaryProps) {
  return (
    <Card component="section" aria-labelledby={HEADING_ID} variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Typography id={HEADING_ID} variant="h6" component="h2">
              Trip summary
            </Typography>
            {trip.requires_34h_restart ? (
              <Chip
                label="34-hr restart inserted"
                color="warning"
                size="small"
                icon={<RestoreRounded fontSize="small" />}
              />
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {trip.current_location} → {trip.pickup_location} → {trip.dropoff_location}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Stat label="Total distance" value={formatMiles(trip.total_distance_mi)} />
            <Stat label="Total duration" value={formatDuration(trip.total_duration_hr)} />
            <Stat label="Log days" value={formatLogDays(trip.logs.length)} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

interface StatProps {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="overline"
        component="div"
        color="text.secondary"
        sx={{ lineHeight: 1.4 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h5"
        component="div"
        sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}
      >
        {value}
      </Typography>
    </Box>
  )
}
