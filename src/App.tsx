import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ELD Trip Planner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          FMCSA HOS-compliant trip planning. Frontend bootstrap is live.
        </Typography>
      </Box>
    </Container>
  )
}
