import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutoFixHigh from '@mui/icons-material/AutoFixHigh'
import { SAMPLE_TRIP_INPUT, type TripInput } from '@/lib/tripInput'

interface SampleTripCardProps {
  onUseSample: (input: TripInput) => void
  disabled?: boolean
}

export function SampleTripCard({ onUseSample, disabled }: SampleTripCardProps) {
  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="subtitle2" component="h3" gutterBottom>
              Try the sample trip
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los Angeles → Dallas → Atlanta · cycle used 20.0 hrs
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AutoFixHigh />}
            disabled={disabled}
            onClick={() => onUseSample(SAMPLE_TRIP_INPUT)}
            sx={{
              // Explicit, higher-contrast focus ring for keyboard users —
              // MUI's default focus-visible style is subtle on outlined
              // buttons, especially against the off-white card background.
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            Use sample
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
