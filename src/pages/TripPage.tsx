import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useParams } from 'react-router'

export default function TripPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <Container maxWidth="lg" component="main">
      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trip {id}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Summary, map, and daily logs render here once the data hooks
          land in upcoming phases.
        </Typography>
      </Box>
    </Container>
  )
}
