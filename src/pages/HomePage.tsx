import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function HomePage() {
  return (
    <Container maxWidth="md" component="main">
      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Plan a trip
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The trip-input form lands in the next phase. This shell is the
          home route placeholder.
        </Typography>
      </Box>
    </Container>
  )
}
