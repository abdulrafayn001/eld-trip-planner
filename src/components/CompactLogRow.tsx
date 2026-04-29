/**
 * <CompactLogRow /> — one row per calendar day, used by the "Compact"
 * variant of the Daily Logs view. Renders the date + miles on the left,
 * a tiny 4-row duty grid in the middle, and a per-status totals strip
 * on the right. Useful for at-a-glance review of a multi-day trip.
 */
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import {
  DUTY_STATUS_ROW_INDEX,
  formatHours,
  formatLogDate,
  totalsFromLog,
} from '@/lib/dailyLog'
import type { DailyLog, DutyStatus } from '@/lib/trip'
import { FONT_MONO } from '@/theme/theme'

interface CompactLogRowProps {
  log: DailyLog
  index: number
  total: number
}

const ROW_FILL = ['var(--status-off)', 'var(--status-sb)', 'var(--status-d)', 'var(--status-on)']
const STATUS_LABELS: { key: DutyStatus; label: string }[] = [
  { key: 'OFF', label: 'Off' },
  { key: 'SB', label: 'SB' },
  { key: 'D', label: 'Drv' },
  { key: 'ON', label: 'On' },
]

export function CompactLogRow({ log, index, total }: CompactLogRowProps) {
  const totals = totalsFromLog(log)
  const dayOf = `Day ${index + 1} of ${total}`
  return (
    <Card
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '110px 1fr 320px' },
        gap: { xs: 1.5, sm: 2 },
        alignItems: 'center',
        px: 2.25,
        py: 1.75,
        boxShadow: 1,
      }}
    >
      <Box>
        <Typography
          component="div"
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.06em',
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          {dayOf}
        </Typography>
        <Typography
          component="div"
          sx={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 600 }}
        >
          {formatLogDate(log.date)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {Math.round(log.total_miles).toLocaleString()} mi driven
        </Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <svg viewBox="0 0 720 60" style={{ width: '100%', display: 'block' }} aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={0} y={i * 14} width={720} height={14} fill={ROW_FILL[i]} opacity={0.85} />
          ))}
          {log.segments.map((s, i) => (
            <rect
              key={i}
              x={(s.start_hr / 24) * 720}
              y={DUTY_STATUS_ROW_INDEX[s.duty_status] * 14 + 2}
              width={((s.end_hr - s.start_hr) / 24) * 720}
              height={10}
              fill="var(--status-line)"
              opacity={0.85}
            />
          ))}
          {Array.from({ length: 23 }, (_, i) => (
            <line
              key={i}
              x1={((i + 1) / 24) * 720}
              x2={((i + 1) / 24) * 720}
              y1={0}
              y2={56}
              stroke="rgba(0,0,0,0.12)"
              strokeWidth={0.5}
            />
          ))}
        </svg>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
        {STATUS_LABELS.map(({ key, label }, i) => (
          <Box
            key={key}
            sx={{
              textAlign: 'center',
              p: 0.75,
              borderRadius: 0.75,
              backgroundColor: ROW_FILL[i],
              opacity: 0.95,
            }}
          >
            <Typography
              component="div"
              sx={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </Typography>
            <Typography
              component="div"
              sx={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600 }}
            >
              {formatHours(totals[key])}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}
