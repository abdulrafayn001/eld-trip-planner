import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'

interface TripPageErrorProps {
  message: string
  onRetry: () => void
}

export function TripPageError({ message, onRetry }: TripPageErrorProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      <AlertTitle>Couldn&apos;t load this trip</AlertTitle>
      {message}
    </Alert>
  )
}
