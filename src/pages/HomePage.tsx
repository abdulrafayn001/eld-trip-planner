import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SampleTripCard } from '@/components/SampleTripCard'
import { TripForm } from '@/components/TripForm'
import { useCreateTrip } from '@/hooks/useCreateTrip'
import {
  EMPTY_TRIP_INPUT,
  loadLastTripInput,
  saveLastTripInput,
  type TripInput,
} from '@/lib/tripInput'

export default function HomePage() {
  const createTrip = useCreateTrip()
  const [defaults, setDefaults] = useState<TripInput>(
    () => loadLastTripInput() ?? EMPTY_TRIP_INPUT,
  )
  // Bumping the key on prefill remounts the form so RHF picks up the new
  // defaults without an imperative reset() call.
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = (input: TripInput) => {
    saveLastTripInput(input)
    createTrip.mutate(input)
  }

  const handleUseSample = (input: TripInput) => {
    setDefaults(input)
    setFormKey((k) => k + 1)
  }

  return (
    <Container maxWidth="md" component="main">
      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Plan a trip
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your current location, pickup, drop-off, and the
              cycle hours you&apos;ve already used in this 8-day window.
            </Typography>
          </Box>
          <TripForm
            key={formKey}
            defaultValues={defaults}
            isPending={createTrip.isPending}
            onSubmit={handleSubmit}
          />
          <SampleTripCard
            onUseSample={handleUseSample}
            disabled={createTrip.isPending}
          />
        </Stack>
      </Box>
    </Container>
  )
}
