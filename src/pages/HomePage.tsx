import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { PlanPreview, PlanPreviewEmpty } from '@/components/PlanPreview'
import { TripForm } from '@/components/TripForm'
import { useCreateTrip } from '@/hooks/useCreateTrip'
import {
  EMPTY_TRIP_INPUT,
  loadLastTripInput,
  saveLastTripInput,
  type TripInput,
} from '@/lib/tripInput'

const STEPS = ['Details', 'Review', 'Logs']

export default function HomePage() {
  const createTrip = useCreateTrip()
  const [defaults, setDefaults] = useState<TripInput>(
    () => loadLastTripInput() ?? EMPTY_TRIP_INPUT,
  )
  const [formKey, setFormKey] = useState(0)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const activeStep = createdId ? 1 : 0

  const handleSubmit = (input: TripInput) => {
    saveLastTripInput(input)
    createTrip.mutate(input, {
      onSuccess: ({ id }) => setCreatedId(id),
    })
  }

  const handleUseSample = (input: TripInput) => {
    setDefaults(input)
    setFormKey((k) => k + 1)
    setCreatedId(null)
  }

  const handleReset = () => {
    setCreatedId(null)
  }

  return (
    <Container maxWidth="xl" component="main">
      <Box sx={{ py: { xs: 3, sm: 4 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            mb: 2,
            gap: 2,
            alignItems: { xs: 'flex-start', md: 'flex-end' },
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
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.dark' },
                }}
              >
                Trips
              </Box>
              <Box component="span" sx={{ color: 'text.disabled' }}>/</Box>
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                Plan a trip
              </Box>
            </Box>
            <Typography variant="h4" component="h1" sx={{ mb: 0.25 }}>
              Plan a trip
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Route the load, schedule rests &amp; breaks, draw your daily logs.
            </Typography>
          </Box>
          <Stepper activeStep={activeStep} sx={{ minWidth: 280 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '480px 1fr' },
            gap: { xs: 2, md: 2.5 },
            alignItems: 'start',
          }}
        >
          <TripForm
            key={formKey}
            defaultValues={defaults}
            isPending={createTrip.isPending}
            onSubmit={handleSubmit}
            onReset={handleReset}
            compact
            onUseSample={handleUseSample}
          />

          <Box>
            {createdId ? <PlanPreview tripId={createdId} /> : <PlanPreviewEmpty />}
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
