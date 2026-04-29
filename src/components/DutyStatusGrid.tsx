/**
 * <DutyStatusGrid /> — the 4×24 duty-status grid sub-component of the
 * FMCSA Driver's Daily Log (spec §5.2).
 *
 * Pure SVG, no MUI dependency. The component renders:
 *   - 4 rows (Off Duty / Sleeper Berth / Driving / On Duty not driving)
 *   - 24 hour columns × 4 ticks/hour (15-minute subdivisions)
 *   - A `stroke="black"` 2 px duty-status polyline drawn from `segments[]`
 *     with vertical jumps at status changes
 *   - A right-side total-hours column (HH:MM)
 *
 * Static SVG layers (rect, row dividers, hour grid, ticks, hour + row
 * labels) are pre-built at module load — only the polyline and totals
 * change with props.
 */
import { Fragment, useMemo } from 'react'
import type { DailyLogSegment, DutyStatus } from '@/lib/trip'

interface DutyStatusGridProps {
  segments: DailyLogSegment[]
  /** Optional override; falls back to summing `segments` per status. */
  totals?: Record<DutyStatus, number>
  /** Accessible label for the SVG (standalone use only). */
  ariaLabel?: string
  /** Inline style passthrough — the parent sheet controls sizing. */
  style?: React.CSSProperties
  /**
   * SVG positioning attributes — set when nesting this grid inside another
   * `<svg>` element (e.g., from `<DailyLogSheet>`). When provided, the
   * outer `<svg>` uses the SVG `x`/`y`/`width`/`height` attributes
   * instead of the responsive CSS sizing used standalone.
   */
  x?: number
  y?: number
  width?: number
  height?: number
}

// ---------------------------------------------------------------------------
// Geometry constants — viewBox derives from these so the grid is the only
// thing the component is sized for.
// ---------------------------------------------------------------------------
const HOURS = 24
const HOUR_TICKS = 4
const ROWS: readonly DutyStatus[] = ['OFF', 'SB', 'D', 'ON'] as const
const ROW_LABELS: Record<DutyStatus, string> = {
  OFF: '1. Off Duty',
  SB: '2. Sleeper Berth',
  D: '3. Driving',
  ON: '4. On Duty (not driving)',
}

const HOUR_WIDTH = 32
const ROW_HEIGHT = 30
const HOUR_LABEL_HEIGHT = 30
const LEFT_LABEL_WIDTH = 144
const TOTAL_LABEL_WIDTH = 64
const PAD = 6

const GRID_WIDTH = HOURS * HOUR_WIDTH
const GRID_HEIGHT = ROWS.length * ROW_HEIGHT
const SVG_WIDTH = LEFT_LABEL_WIDTH + GRID_WIDTH + TOTAL_LABEL_WIDTH + PAD * 2
const SVG_HEIGHT = HOUR_LABEL_HEIGHT + GRID_HEIGHT + PAD * 2

/** Outer viewBox dimensions — useful when nesting inside a parent SVG. */
export const DUTY_STATUS_GRID_VIEW_WIDTH = SVG_WIDTH
export const DUTY_STATUS_GRID_VIEW_HEIGHT = SVG_HEIGHT
const GRID_LEFT = LEFT_LABEL_WIDTH + PAD
const GRID_TOP = HOUR_LABEL_HEIGHT + PAD
/**
 * Inner-viewBox X of the grid's hour-0 column and the width of one
 * hour column. Exported so consumers nesting the grid inside a larger
 * sheet (e.g. <DailyLogSheet>) can map a duty-event hour back to the
 * exact sheet x without hand-mirroring constants and risking drift.
 */
export const DUTY_STATUS_GRID_LEFT = GRID_LEFT
export const DUTY_STATUS_GRID_HOUR_WIDTH = HOUR_WIDTH

const INK = '#000'
const PAPER = '#fff'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ROW_INDEX: Record<DutyStatus, number> = { OFF: 0, SB: 1, D: 2, ON: 3 }

function hourToX(hr: number): number {
  return hr * HOUR_WIDTH
}

function rowCenterY(status: DutyStatus): number {
  return ROW_INDEX[status] * ROW_HEIGHT + ROW_HEIGHT / 2
}

function buildPolylinePoints(segments: DailyLogSegment[]): string {
  if (segments.length === 0) return ''
  const points: string[] = []
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    const y = rowCenterY(s.duty_status)
    if (i === 0) {
      points.push(`${hourToX(s.start_hr)},${y}`)
    } else if (segments[i - 1].duty_status !== s.duty_status) {
      // Vertical jump at the status change
      points.push(`${hourToX(s.start_hr)},${y}`)
    }
    points.push(`${hourToX(s.end_hr)},${y}`)
  }
  return points.join(' ')
}

function computeTotals(segments: DailyLogSegment[]): Record<DutyStatus, number> {
  const totals: Record<DutyStatus, number> = { OFF: 0, SB: 0, D: 0, ON: 0 }
  for (const s of segments) totals[s.duty_status] += s.end_hr - s.start_hr
  return totals
}

function formatTotal(hours: number): string {
  const totalMinutes = Math.max(0, Math.round(hours * 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function hourLabelText(h: number): string {
  if (h === 0 || h === HOURS) return 'Midnight'
  if (h === 12) return 'Noon'
  return String(h % 12 || 12)
}

// ---------------------------------------------------------------------------
// Static layers — built once at module load. None of this depends on props.
// ---------------------------------------------------------------------------
const HOUR_LABELS_LAYER = (
  <g
    fill={INK}
    fontFamily='"Roboto", "Helvetica", sans-serif'
    fontSize={9}
    textAnchor="middle"
  >
    {Array.from({ length: HOURS + 1 }, (_, h) => {
      const x = GRID_LEFT + h * HOUR_WIDTH
      const label = hourLabelText(h)
      const isMidnight = label === 'Midnight'
      const baseY = HOUR_LABEL_HEIGHT - 6
      if (isMidnight) {
        return (
          <text key={h} x={x} y={baseY - 9}>
            <tspan x={x}>Mid-</tspan>
            <tspan x={x} dy={9}>night</tspan>
          </text>
        )
      }
      return (
        <text key={h} x={x} y={baseY}>
          {label}
        </text>
      )
    })}
  </g>
)

const ROW_LABELS_LAYER = (
  <g
    fill={INK}
    fontFamily='"Roboto", "Helvetica", sans-serif'
    fontSize={10}
    textAnchor="end"
  >
    {ROWS.map((status, i) => (
      <text
        key={status}
        x={GRID_LEFT - 6}
        y={GRID_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 3}
      >
        {ROW_LABELS[status]}
      </text>
    ))}
  </g>
)

const GRID_LAYER = (
  <g transform={`translate(${GRID_LEFT}, ${GRID_TOP})`}>
    {/* Paper */}
    <rect
      x={0}
      y={0}
      width={GRID_WIDTH}
      height={GRID_HEIGHT}
      fill={PAPER}
      stroke={INK}
      strokeWidth={1}
    />
    {/* Horizontal row dividers */}
    {Array.from({ length: ROWS.length - 1 }, (_, i) => (
      <line
        key={`row-${i}`}
        x1={0}
        y1={(i + 1) * ROW_HEIGHT}
        x2={GRID_WIDTH}
        y2={(i + 1) * ROW_HEIGHT}
        stroke={INK}
        strokeWidth={0.75}
      />
    ))}
    {/* Vertical hour gridlines */}
    {Array.from({ length: HOURS - 1 }, (_, i) => (
      <line
        key={`hour-${i}`}
        x1={(i + 1) * HOUR_WIDTH}
        y1={0}
        x2={(i + 1) * HOUR_WIDTH}
        y2={GRID_HEIGHT}
        stroke={INK}
        strokeWidth={0.5}
      />
    ))}
    {/* 15-minute ticks at top and bottom of each row (longer at the half-hour) */}
    {ROWS.map((_, rowIdx) => {
      const rowTop = rowIdx * ROW_HEIGHT
      const rowBottom = (rowIdx + 1) * ROW_HEIGHT
      const subticks: React.ReactNode[] = []
      for (let h = 0; h < HOURS; h++) {
        for (let t = 1; t < HOUR_TICKS; t++) {
          const x = h * HOUR_WIDTH + (t * HOUR_WIDTH) / HOUR_TICKS
          const len = t === HOUR_TICKS / 2 ? 6 : 4
          subticks.push(
            <line
              key={`tick-top-${rowIdx}-${h}-${t}`}
              x1={x}
              y1={rowTop}
              x2={x}
              y2={rowTop + len}
              stroke={INK}
              strokeWidth={0.5}
            />,
            <line
              key={`tick-bot-${rowIdx}-${h}-${t}`}
              x1={x}
              y1={rowBottom - len}
              x2={x}
              y2={rowBottom}
              stroke={INK}
              strokeWidth={0.5}
            />,
          )
        }
      }
      return <Fragment key={`ticks-${rowIdx}`}>{subticks}</Fragment>
    })}
  </g>
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DutyStatusGrid({
  segments,
  totals,
  ariaLabel = 'Driver duty status grid for one calendar day',
  style,
  x,
  y,
  width,
  height,
}: DutyStatusGridProps) {
  const polylinePoints = useMemo(() => buildPolylinePoints(segments), [segments])
  const resolvedTotals = useMemo<Record<DutyStatus, number>>(
    () => totals ?? computeTotals(segments),
    [totals, segments],
  )

  const isNested = x !== undefined || y !== undefined || width !== undefined || height !== undefined

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      x={x}
      y={y}
      width={width}
      height={height}
      role={isNested ? undefined : 'img'}
      aria-label={isNested ? undefined : ariaLabel}
      style={isNested ? undefined : { width: '100%', height: 'auto', display: 'block', ...style }}
    >
      {HOUR_LABELS_LAYER}
      {ROW_LABELS_LAYER}
      {GRID_LAYER}

      {polylinePoints ? (
        <polyline
          transform={`translate(${GRID_LEFT}, ${GRID_TOP})`}
          points={polylinePoints}
          fill="none"
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />
      ) : null}

      {/* Right total-hours column */}
      <g
        transform={`translate(${GRID_LEFT + GRID_WIDTH}, ${GRID_TOP})`}
        fill={INK}
        fontFamily='ui-monospace, "SF Mono", Menlo, monospace'
        fontSize={11}
        textAnchor="middle"
      >
        {ROWS.map((status, i) => (
          <text
            key={status}
            x={TOTAL_LABEL_WIDTH / 2}
            y={i * ROW_HEIGHT + ROW_HEIGHT / 2 + 4}
          >
            {formatTotal(resolvedTotals[status])}
          </text>
        ))}
        <text
          x={TOTAL_LABEL_WIDTH / 2}
          y={-PAD}
          fontFamily='"Roboto", "Helvetica", sans-serif'
          fontSize={9}
        >
          Total
        </text>
      </g>
    </svg>
  )
}
