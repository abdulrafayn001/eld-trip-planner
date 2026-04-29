import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { AppHeader } from '@/components/AppHeader'

export default function App() {
  return (
    <>
      <AppHeader />
      <Container maxWidth="md">
        <Box sx={{ py: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="body1" color="text.secondary">
            FMCSA HOS-compliant trip planning. Use the header toggle to switch
            between light and dark mode &mdash; your choice persists across reloads.
          </Typography>
        </Box>
      </Container>
    </>
  )
}
