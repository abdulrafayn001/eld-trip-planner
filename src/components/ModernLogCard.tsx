/**
 * <ModernLogCard /> — clean dashboard-style daily-log card. Used by the
 * "Modern" view variant. Renders title + meta block, color-coded duty
 * grid, totals strip with proportional bars, remarks chip list, and a
 * compact recap (on-duty totals + 70/8 + 60/7 cycle availability).
 */
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  DUTY_STATUS_ROW_INDEX,
  formatHours,
  formatLogDate,
  totalsFromLog,
} from '@/lib/dailyLog'
import { compactLocation } from '@/lib/format'
import type { DailyLog, DailyLogSegment, DutyStatus } from '@/lib/trip'
import { FONT_MONO } from '@/theme/theme'

interface ModernLogCardProps {
  log: DailyLog
  index: number
  total: number
  onDutyLast7Days?: number
  onDutyLast8Days?: number
  onDutyLast5Days?: number
}

const ROW_FILL: Record<DutyStatus, string> = {
  OFF: 'var(--status-off)',
  SB: 'var(--status-sb)',
  D: 'var(--status-d)',
  ON: 'var(--status-on)',
}

const STATUS_TILES: Array<{
  key: DutyStatus
  label: string
  className: 'off' | 'sb' | 'driving' | 'on'
}> = [
  { key: 'OFF', label: 'Off Duty', className: 'off' },
  { key: 'SB', label: 'Sleeper Berth', className: 'sb' },
  { key: 'D', label: 'Driving', className: 'driving' },
  { key: 'ON', label: 'On Duty (not driving)', className: 'on' },
]

export function ModernLogCard({
  log,
  index,
  total,
  onDutyLast7Days,
  onDutyLast8Days,
  onDutyLast5Days,
}: ModernLogCardProps) {
  const totals = totalsFromLog(log)
  const onDutyToday = totals.D + totals.ON
  const offDutyToday = totals.OFF + totals.SB
  const dayOf = `Day ${index + 1} of ${total}`
  const remarks = pickRemarks(log.segments)

  const cycle70Available =
    onDutyLast7Days === undefined
      ? undefined
      : Math.max(0, 70 - onDutyLast7Days)
  const cycle60Available =
    onDutyLast8Days === undefined
      ? undefined
      : Math.max(0, 60 - onDutyLast8Days)

  return (
    <Card
      className="log-sheet"
      sx={{
        bgcolor: 'background.paper',
        p: { xs: 2.5, sm: 3 },
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          justifyContent: 'space-between',
          borderBottom: 2,
          borderColor: 'text.primary',
          pb: 1.25,
          gap: 1,
        }}
      >
        <Box>
          <Typography component="h3" sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Driver's Daily Log
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (24 hours)
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography
            component="div"
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: '0.06em',
              color: 'text.secondary',
              textTransform: 'uppercase',
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
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Original — File at home terminal.
            <br />
            Duplicate — Driver retains for 8 days.
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '180px 1fr 1fr' },
          gap: 3,
        }}
      >
        <Box
          sx={{
            border: 1,
            borderColor: 'text.primary',
            borderRadius: 1,
            px: 2,
            py: 1.75,
            textAlign: 'center',
          }}
        >
          <Typography
            component="div"
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {Math.round(log.total_miles).toLocaleString()}
          </Typography>
          <Typography
            component="div"
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: 'text.secondary',
              mt: 0.75,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Total Miles Driving
          </Typography>
        </Box>

        <MetaStack
          rows={[
            { label: 'From', value: log.from_label, fallback: false },
            { label: 'To', value: log.to_label, fallback: false },
            { label: 'Carrier', value: '— enter on print —', fallback: true },
          ]}
        />
        <MetaStack
          rows={[
            { label: 'Driver', value: '', fallback: true, fallbackText: '— enter on print —' },
            {
              label: 'Truck / Trailer',
              value: '',
              fallback: true,
              fallbackText: '— enter on print —',
            },
            {
              label: 'Home terminal',
              value: '',
              fallback: true,
              fallbackText: '— enter on print —',
            },
          ]}
        />
      </Box>

      <ColorDutyGrid segments={log.segments} totals={totals} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {STATUS_TILES.map(({ key, label, className }, i) => {
          const hours = totals[key]
          const pct = Math.min(100, (hours / 24) * 100)
          return (
            <Box
              key={key}
              sx={{
                px: 1.75,
                py: 1.5,
                borderRight: { xs: i % 2 === 0 ? 1 : 0, sm: i < 3 ? 1 : 0 },
                borderBottom: { xs: i < 2 ? 1 : 0, sm: 0 },
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}
              >
                {label}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: 18,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: className === 'driving' ? 'secondary.main' : 'text.primary',
                }}
              >
                {formatHours(hours)}
              </Typography>
              <Box
                sx={{
                  height: 4,
                  backgroundColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mt: 0.5,
                }}
                aria-hidden
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: ROW_FILL[key],
                    transition: 'width 250ms ease',
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box
        sx={{
          mt: 1,
          px: 1.75,
          py: 1.5,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          component="div"
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            mb: 1,
            fontWeight: 600,
          }}
        >
          Remarks &amp; duty changes
        </Typography>
        {remarks.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No off-route stops on this day.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {remarks.map((r, i) => (
              <Box key={i} sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.75, fontSize: 12 }}>
                <Box
                  component="span"
                  sx={{ fontFamily: FONT_MONO, fontSize: 10, color: 'text.secondary' }}
                >
                  {r.t}
                </Box>
                <Box component="span">{r.label}</Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          mt: 1,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gap: 3,
        }}
      >
        <Box>
          <Typography
            component="h4"
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'text.secondary',
              mb: 1.5,
            }}
          >
            Recap — end of day
          </Typography>
          <Stack spacing={0.75}>
            <RecapLine label="On-duty hours today (3 + 4)" value={formatHours(onDutyToday)} />
            <RecapLine label="Off-duty + sleeper (1 + 2)" value={formatHours(offDutyToday)} />
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
          <CycleBlock
            title="70-hour / 8-day cycle"
            cells={[
              { k: 'A · Last 7', v: formatHours(onDutyLast7Days) },
              { k: 'B · Avail.', v: formatHours(cycle70Available) },
              { k: 'C · Last 5', v: formatHours(onDutyLast5Days) },
            ]}
          />
          <CycleBlock
            title="60-hour / 7-day cycle"
            cells={[
              { k: 'A · Last 8', v: formatHours(onDutyLast8Days) },
              { k: 'B · Avail.', v: formatHours(cycle60Available) },
              { k: 'C · Last 5', v: formatHours(onDutyLast5Days) },
            ]}
          />
        </Box>
      </Box>
    </Card>
  )
}

function MetaStack({
  rows,
}: {
  rows: Array<{
    label: string
    value: string
    fallback: boolean
    fallbackText?: string
  }>
}) {
  return (
    <Stack spacing={1.25}>
      {rows.map(({ label, value, fallback, fallbackText }) => (
        <Box key={label}>
          <Typography
            component="div"
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              fontSize: 13,
              borderBottom: 1,
              borderColor: 'divider',
              pb: 0.375,
              minHeight: 20,
              color: fallback ? 'text.secondary' : 'text.primary',
              fontStyle: fallback ? 'italic' : 'normal',
            }}
          >
            {fallback ? fallbackText ?? value : value}
          </Box>
        </Box>
      ))}
    </Stack>
  )
}

function RecapLine({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', fontSize: 12 }}
    >
      <Box component="span">{label}</Box>
      <Box component="span" sx={{ fontFamily: FONT_MONO, fontWeight: 600 }}>
        {value}
      </Box>
    </Stack>
  )
}

function CycleBlock({
  title,
  cells,
}: {
  title: string
  cells: Array<{ k: string; v: string }>
}) {
  return (
    <Box
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.75,
      }}
    >
      <Typography component="div" sx={{ fontSize: 12, fontWeight: 600, mb: 1.25 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
        {cells.map(({ k, v }) => (
          <Box key={k} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              component="span"
              sx={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: 'text.secondary',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              {k}
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: FONT_MONO,
                fontSize: 15,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {v}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

interface Remark {
  t: string
  label: string
}

function pickRemarks(segments: DailyLogSegment[]): Remark[] {
  const out: Remark[] = []
  let prevStatus: DutyStatus | null = null
  for (const s of segments) {
    if (s.duty_status === prevStatus) continue
    prevStatus = s.duty_status
    const label = labelForSegment(s)
    if (!label) continue
    out.push({ t: hourToHHMM(s.start_hr), label })
  }
  return out
}

function labelForSegment(s: DailyLogSegment): string {
  const compactLoc = compactLocation(s.location_label)
  if (s.activity === 'Driving' && (!compactLoc || compactLoc === 'En route')) return ''
  if (compactLoc && compactLoc !== 'En route') return compactLoc
  return s.activity
}

function hourToHHMM(hr: number): string {
  const total = Math.max(0, Math.round(hr * 60))
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ----- Color-coded duty grid (pure SVG, FMCSA palette) -----
const GRID_LEFT = 78
const GRID_TOP = 30
const HOUR_W = 26
const ROW_H = 32

interface ColorDutyGridProps {
  segments: DailyLogSegment[]
  totals: Record<DutyStatus, number>
}

function ColorDutyGrid({ segments, totals }: ColorDutyGridProps) {
  const w = GRID_LEFT + 24 * HOUR_W + 64
  const h = GRID_TOP + 4 * ROW_H + 14
  const labels = ['1. Off Duty', '2. Sleeper Berth', '3. Driving', '4. On Duty']
  const rowFill = [ROW_FILL.OFF, ROW_FILL.SB, ROW_FILL.D, ROW_FILL.ON]
  const totalsArr = [totals.OFF, totals.SB, totals.D, totals.ON].map(formatHours)

  const polylinePoints = buildPolyline(segments)

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block', minWidth: 720 }}>
        <g
          fontFamily={FONT_MONO}
          fontSize={9}
          fill="currentColor"
          textAnchor="middle"
          fontWeight={500}
          opacity={0.7}
        >
          {Array.from({ length: 25 }, (_, i) => {
            const x = GRID_LEFT + i * HOUR_W
            let label = String(i % 12 || 12)
            if (i === 0 || i === 24) label = 'Mid'
            else if (i === 12) label = 'Noon'
            return (
              <text key={i} x={x} y={20}>
                {label}
              </text>
            )
          })}
          <text x={GRID_LEFT + 24 * HOUR_W + 32} y={20}>
            TOTAL
          </text>
        </g>
        <g
          fontFamily="Inter, sans-serif"
          fontSize={10}
          fill="currentColor"
          textAnchor="end"
          fontWeight={500}
        >
          {labels.map((l, i) => (
            <text key={i} x={GRID_LEFT - 8} y={GRID_TOP + i * ROW_H + ROW_H / 2 + 3}>
              {l}
            </text>
          ))}
        </g>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={GRID_LEFT}
            y={GRID_TOP + i * ROW_H}
            width={24 * HOUR_W}
            height={ROW_H}
            fill={rowFill[i]}
            opacity={0.85}
          />
        ))}
        <rect
          x={GRID_LEFT}
          y={GRID_TOP}
          width={24 * HOUR_W}
          height={4 * ROW_H}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        />
        {[1, 2, 3].map((i) => (
          <line
            key={i}
            x1={GRID_LEFT}
            x2={GRID_LEFT + 24 * HOUR_W}
            y1={GRID_TOP + i * ROW_H}
            y2={GRID_TOP + i * ROW_H}
            stroke="currentColor"
            strokeWidth={0.6}
          />
        ))}
        {Array.from({ length: 23 }, (_, i) => (
          <line
            key={i}
            x1={GRID_LEFT + (i + 1) * HOUR_W}
            x2={GRID_LEFT + (i + 1) * HOUR_W}
            y1={GRID_TOP}
            y2={GRID_TOP + 4 * ROW_H}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.18}
          />
        ))}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="var(--status-line)"
          strokeWidth={2.2}
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />
        <g
          fontFamily={FONT_MONO}
          fontSize={11}
          fontWeight={600}
          fill="currentColor"
          textAnchor="middle"
        >
          {totalsArr.map((t, i) => (
            <text key={i} x={GRID_LEFT + 24 * HOUR_W + 32} y={GRID_TOP + i * ROW_H + ROW_H / 2 + 4}>
              {t}
            </text>
          ))}
        </g>
      </svg>
    </Box>
  )
}

function buildPolyline(segments: DailyLogSegment[]): string {
  const pts: string[] = []
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    const y = GRID_TOP + DUTY_STATUS_ROW_INDEX[s.duty_status] * ROW_H + ROW_H / 2
    if (i === 0) pts.push(`${GRID_LEFT + s.start_hr * HOUR_W},${y}`)
    else if (segments[i - 1].duty_status !== s.duty_status) {
      pts.push(`${GRID_LEFT + s.start_hr * HOUR_W},${y}`)
    }
    pts.push(`${GRID_LEFT + s.end_hr * HOUR_W},${y}`)
  }
  return pts.join(' ')
}
