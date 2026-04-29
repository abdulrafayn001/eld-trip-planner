import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { TripPageError } from '@/components/TripPageError'
import { TripPageSkeleton } from '@/components/TripPageSkeleton'
import { TripSummary } from '@/components/TripSummary'
import { useTrip } from '@/hooks/useTrip'

export default function TripPage() {
  const { id = '' } = useParams<{ id: string }>()
  const query = useTrip(id)

  const handleRetry = () => {
    void query.refetch()
  }

  let content: ReactNode
  if (query.isPending) {
    content = <TripPageSkeleton />
  } else if (query.isError) {
    content = <TripPageError message={query.error.message} onRetry={handleRetry} />
  } else {
    content = (
      <Stack spacing={3}>
        <TripSummary trip={query.data} />
        {/* Map (F6) and daily log sheets (F7) render here. */}
      </Stack>
    )
  }

  return (
    <Container maxWidth="lg" component="main">
      <Box sx={{ py: { xs: 4, sm: 6 } }}>{content}</Box>
    </Container>
  )
}
