import { useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import {
  DailyLogSheet,
  type DailyLogSheetCumulative,
} from '@/components/DailyLogSheet'
import { TripMap } from '@/components/TripMap'
import { TripPageError } from '@/components/TripPageError'
import { TripPageSkeleton } from '@/components/TripPageSkeleton'
import { TripSummary } from '@/components/TripSummary'
import { useTrip } from '@/hooks/useTrip'
import type { DailyLog } from '@/lib/trip'

export default function TripPage() {
  const { id = '' } = useParams<{ id: string }>()
  const query = useTrip(id)

  // Cumulative on-duty hours per log date — within this trip only, since
  // we don't have prior 7/8/5-day history. Walks logs once and folds the
  // running total; passed into each <DailyLogSheet>'s recap band.
  const cumulativeByDate = useMemo<Record<string, DailyLogSheetCumulative>>(() => {
    const logs = query.data?.logs ?? []
    return buildCumulativeByDate(logs)
  }, [query.data?.logs])

  const handleRetry = () => {
    void query.refetch()
  }

  const handlePrint = () => {
    window.print()
  }

  let content: ReactNode
  if (query.isPending) {
    content = <TripPageSkeleton />
  } else if (query.isError) {
    content = <TripPageError message={query.error.message} onRetry={handleRetry} />
  } else {
    const trip = query.data
    const hasLogs = trip.logs.length > 0
    content = (
      <Stack spacing={3}>
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<PrintRoundedIcon />}
            onClick={handlePrint}
            disabled={!hasLogs}
          >
            Print all logs
          </Button>
        </Stack>
        <TripSummary trip={trip} />
        <TripMap trip={trip} />
        <Stack spacing={2}>
          {trip.logs.map((log) => (
            <DailyLogSheet
              key={log.date}
              log={log}
              cumulative={cumulativeByDate[log.date]}
              requires34hRestart={trip.requires_34h_restart}
            />
          ))}
        </Stack>
      </Stack>
    )
  }

  return (
    <Container maxWidth="lg" component="main">
      <Box sx={{ py: { xs: 4, sm: 6 } }}>{content}</Box>
    </Container>
  )
}

function buildCumulativeByDate(logs: DailyLog[]): Record<string, DailyLogSheetCumulative> {
  const map: Record<string, DailyLogSheetCumulative> = {}
  let runningOnDuty = 0
  for (const log of logs) {
    runningOnDuty += log.total_driving + log.total_on_duty
    map[log.date] = {
      onDutyLast7Days: runningOnDuty,
      onDutyLast8Days: runningOnDuty,
      onDutyLast5Days: runningOnDuty,
    }
  }
  return map
}
