import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

/**
 * Loading state for `<TripPage>`. Heights match the eventual sizes of
 * the summary card, map, and log-sheet stack so the layout doesn't
 * jump when real content swaps in.
 */
export function TripPageSkeleton() {
  return (
    <Stack spacing={3} aria-busy="true" aria-live="polite">
      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 3 }} />
    </Stack>
  )
}
