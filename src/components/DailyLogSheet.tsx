/**
 * <DailyLogSheet /> — full FMCSA Driver's Daily Log sheet (spec §5.2).
 *
 * 850×1100 viewBox at FMCSA-form proportions. The sheet is one big SVG
 * embedded in an MUI <Card className="log-sheet">; F8's print CSS
 * targets that class to render one sheet per page. Static layout
 * (rules, labels, headings) lives in module-level helpers; per-day
 * data (date, miles, segments, totals, cumulative) flows through
 * props.
 *
 * Layout, top-to-bottom:
 *   1. Header band       — title, date, miles, carrier/office/etc.
 *   2. Duty grid band    — nested <DutyStatusGrid />
 *   3. Remarks band      — rotated -60° city/state labels at duty changes
 *   4. Shipping band     — DVL / shipping document lines
 *   5. Recap band        — hours today, available tomorrow, 70/8 + 60/7
 */
import { useMemo, type ReactNode } from 'react'
import Card from '@mui/material/Card'
import {
  DutyStatusGrid,
  DUTY_STATUS_GRID_HOUR_WIDTH,
  DUTY_STATUS_GRID_LEFT,
  DUTY_STATUS_GRID_VIEW_WIDTH,
} from '@/components/DutyStatusGrid'
import { compactLocation } from '@/lib/format'
import type { DailyLog, DailyLogSegment, DutyStatus } from '@/lib/trip'

// ---------------------------------------------------------------------------
// Sheet geometry
// ---------------------------------------------------------------------------
const SHEET_WIDTH = 850
const SHEET_HEIGHT = 1100
const SIDE_MARGIN = 24
const CONTENT_WIDTH = SHEET_WIDTH - SIDE_MARGIN * 2

const HEADER_TOP = 16
const HEADER_HEIGHT = 196

const GRID_TOP = HEADER_TOP + HEADER_HEIGHT
const GRID_HEIGHT = 178

const REMARKS_TOP = GRID_TOP + GRID_HEIGHT
const REMARKS_HEIGHT = 90

// ---------------------------------------------------------------------------
// Remarks-band layout: stagger collisions across N rows of horizontal text.
// ---------------------------------------------------------------------------
const REMARK_LABEL_FONT_SIZE = 9
const REMARK_LABEL_CHAR_WIDTH = 5 // approx px per char at fontSize 9
const REMARK_LABEL_MIN_PAD = 6
const REMARK_LABEL_ROW_GAP = 14
const REMARK_LABEL_NUM_ROWS = 3
const REMARK_FIRST_ROW_DY = 28 // offset from REMARKS_TOP to first row baseline

const SHIPPING_TOP = REMARKS_TOP + REMARKS_HEIGHT
const SHIPPING_HEIGHT = 130

const RECAP_TOP = SHIPPING_TOP + SHIPPING_HEIGHT

const INK = '#000'
const HAIRLINE = 0.75
const BORDER = 1
const FONT_LABEL = '"Roboto", "Helvetica", sans-serif'
const FONT_NUMBER = 'ui-monospace, "SF Mono", Menlo, monospace'

const HOURS_PER_CYCLE_70 = 70
const HOURS_PER_CYCLE_60 = 60

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------
export interface DailyLogSheetCumulative {
  /** Hours on duty (D + ON) over the trailing 7 days, including today. */
  onDutyLast7Days?: number
  /** Hours on duty over the trailing 8 days, including today. */
  onDutyLast8Days?: number
  /** Hours on duty over the trailing 5 days, including today (FMCSA "C"). */
  onDutyLast5Days?: number
}

export interface DailyLogSheetHeader {
  carrierName?: string
  mainOfficeAddress?: string
  homeTerminalAddress?: string
  truckTrailerInfo?: string
  driverName?: string
  coDriverName?: string
}

export interface DailyLogSheetProps {
  log: DailyLog
  cumulative?: DailyLogSheetCumulative
  requires34hRestart?: boolean
  header?: DailyLogSheetHeader
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// Sheet-coord scaling: the nested DutyStatusGrid's outer viewBox is
// DUTY_STATUS_GRID_VIEW_WIDTH wide and we render it at CONTENT_WIDTH px,
// so every inner-viewBox coordinate gets multiplied by GRID_X_SCALE to
// land back on the sheet. Using the imported constants keeps DailyLogSheet
// in lock-step with DutyStatusGrid — no drifting hand-mirrored numbers.
const GRID_X_SCALE = CONTENT_WIDTH / DUTY_STATUS_GRID_VIEW_WIDTH
const GRID_X_OFFSET = SIDE_MARGIN + DUTY_STATUS_GRID_LEFT * GRID_X_SCALE
const HOUR_WIDTH_SHEET = DUTY_STATUS_GRID_HOUR_WIDTH * GRID_X_SCALE

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

function formatHours(hours: number | undefined): string {
  if (hours === undefined || Number.isNaN(hours)) return '—'
  const totalMinutes = Math.max(0, Math.round(hours * 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatMilesPlain(miles: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(miles)
}

interface DutyChangeLabel {
  /** Final x in sheet coordinates — already scaled, ready to render. */
  sheetX: number
  label: string
  hour: number
  /**
   * Row index for vertical stagger. When two labels would collide
   * horizontally, the second is bumped to a higher row index so each
   * row stays a single, readable horizontal line of labels.
   */
  rowIndex: number
}

const ACTIVITY_ABBREVIATIONS: Readonly<Record<string, string>> = {
  'Pre-trip inspection': 'Pre-trip',
  'Post-trip inspection': 'Post-trip',
  '30-min break': '30-min break',
  '10-hr daily reset': '10-hr reset',
  '34-hr restart': '34-hr restart',
  Fueling: 'Fuel stop',
  Pickup: 'Pickup',
  'Drop-off': 'Drop-off',
  'Sleeper berth': 'Sleeper',
}

/**
 * Pick the most informative label for a given event. For events at named
 * locations (pre/post-trip, pickup, drop-off) the compacted city/state
 * wins; for breaks / fuel / sleeper we use the activity name; "Driving"
 * with the generic "En route" location returns empty so we don't clutter
 * the band with redundant annotations on every driving segment.
 */
function compactRemarkLabel(activity: string, locationLabel: string): string {
  const compactLoc = compactLocation(locationLabel)
  // Generic "En route" driving segments are the default state — labeling
  // every transition back to driving is noise. Skip them entirely.
  if (activity === 'Driving' && compactLoc === 'En route') return ''
  // Named-location events (geocoded city) — prefer the location.
  if (compactLoc && compactLoc !== 'En route') return compactLoc
  // Fallback to an abbreviated activity name (or the activity itself).
  return ACTIVITY_ABBREVIATIONS[activity] ?? activity
}

function estimateLabelHalfWidth(label: string): number {
  return (label.length * REMARK_LABEL_CHAR_WIDTH) / 2 + REMARK_LABEL_MIN_PAD / 2
}

function buildDutyChangeLabels(segments: DailyLogSegment[]): DutyChangeLabel[] {
  // 1. Walk segments and collect raw duty-change candidates with a
  //    meaningful label (skipping generic driving transitions). The
  //    candidate `sheetX` is already in sheet coordinates so the
  //    polyline transition and the label connector align exactly.
  const candidates: Omit<DutyChangeLabel, 'rowIndex'>[] = []
  for (let i = 0; i < segments.length; i++) {
    const cur = segments[i]
    const prev = segments[i - 1]
    const isChange = i === 0 || (prev && prev.duty_status !== cur.duty_status)
    if (!isChange) continue
    const label = compactRemarkLabel(cur.activity, cur.location_label)
    if (!label) continue
    candidates.push({
      sheetX: GRID_X_OFFSET + cur.start_hr * HOUR_WIDTH_SHEET,
      label,
      hour: cur.start_hr,
    })
  }

  // 2. Drop consecutive duplicates (same label after compaction).
  const deduped = candidates.filter(
    (c, i) => i === 0 || candidates[i - 1].label !== c.label,
  )

  // 3. Lay each label out horizontally; bump to the next row whenever it
  //    would overlap the rightmost label already placed in row 0/1/2.
  //    Row 0 sits closest to the chart; each subsequent row drops by
  //    REMARK_LABEL_ROW_GAP px. Falls through to the last row if all
  //    earlier rows are taken.
  const rowRightEdges = new Array<number>(REMARK_LABEL_NUM_ROWS).fill(
    Number.NEGATIVE_INFINITY,
  )
  return deduped.map((c) => {
    const half = estimateLabelHalfWidth(c.label)
    const left = c.sheetX - half
    const right = c.sheetX + half
    let row = 0
    while (
      row < REMARK_LABEL_NUM_ROWS - 1 &&
      left < rowRightEdges[row]
    ) {
      row += 1
    }
    rowRightEdges[row] = right
    return { ...c, rowIndex: row }
  })
}

function totalsFromLog(log: DailyLog): Record<DutyStatus, number> {
  return {
    OFF: log.total_off_duty,
    SB: log.total_sleeper,
    D: log.total_driving,
    ON: log.total_on_duty,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DailyLogSheet({
  log,
  cumulative,
  requires34hRestart = false,
  header = {},
}: DailyLogSheetProps) {
  const onDutyToday = log.total_driving + log.total_on_duty
  const totals = useMemo(() => totalsFromLog(log), [log])
  const dutyChanges = useMemo(() => buildDutyChangeLabels(log.segments), [log.segments])

  return (
    <Card
      variant="outlined"
      className="log-sheet"
      sx={{
        bgcolor: '#fff',
        color: INK,
        // On phones the sheet would shrink to ~320 px wide and become
        // unreadable; keep a 700 px floor and let the Card scroll
        // horizontally instead. md+ is wide enough that the SVG fits.
        overflow: { xs: 'auto hidden', md: 'hidden' },
        '& > svg': { minWidth: { xs: 700, md: 'auto' } },
      }}
    >
      <svg
        viewBox={`0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Driver's Daily Log for ${log.date}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Outer page border (subtle hairline so the SVG reads as a sheet) */}
        <rect
          x={0.5}
          y={0.5}
          width={SHEET_WIDTH - 1}
          height={SHEET_HEIGHT - 1}
          fill="#fff"
          stroke={INK}
          strokeWidth={HAIRLINE}
        />

        <HeaderBand log={log} header={header} />

        {/* Embedded duty-status grid — nested <svg> via DutyStatusGrid props */}
        <DutyStatusGrid
          segments={log.segments}
          totals={totals}
          x={SIDE_MARGIN}
          y={GRID_TOP}
          width={CONTENT_WIDTH}
          height={GRID_HEIGHT}
        />

        <RemarksBand dutyChanges={dutyChanges} />

        <ShippingBand log={log} />

        <RecapBand
          onDutyToday={onDutyToday}
          totals={totals}
          cumulative={cumulative}
          requires34hRestart={requires34hRestart}
        />
      </svg>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Header band
// ---------------------------------------------------------------------------
interface HeaderBandProps {
  log: DailyLog
  header: DailyLogSheetHeader
}

function HeaderBand({ log, header }: HeaderBandProps) {
  const dateStr = formatDate(log.date)
  const milesStr = formatMilesPlain(log.total_miles)
  const fromCompact = compactLocation(log.from_label)
  const toCompact = compactLocation(log.to_label)

  const titleX = SIDE_MARGIN
  const titleY = HEADER_TOP + 22

  // Date row sits to the right of the title.
  const dateRowX = SHEET_WIDTH - SIDE_MARGIN - 240
  const dateRowY = HEADER_TOP + 18
  const noticeX = SHEET_WIDTH - SIDE_MARGIN - 240
  const noticeY = HEADER_TOP + 38

  // From / To row.
  const fromY = HEADER_TOP + 64

  // Single Total Miles box + carrier block. Dropping the duplicate
  // "Total Mileage Today" — our planner only tracks one number, and
  // showing the same value twice is misleading.
  const milesBoxY = HEADER_TOP + 80
  const milesBoxHeight = 56
  const leftBoxX = SIDE_MARGIN
  const milesBoxWidth = 200

  const carrierStartX = leftBoxX + milesBoxWidth + 32
  const carrierLineWidth = SHEET_WIDTH - SIDE_MARGIN - carrierStartX

  return (
    <g fill={INK}>
      {/* Title block (left) */}
      <text x={titleX} y={titleY} fontFamily={FONT_LABEL} fontSize={20} fontWeight={700}>
        Driver&apos;s Daily Log
      </text>
      <text x={titleX} y={titleY + 16} fontFamily={FONT_LABEL} fontSize={10}>
        (24 hours)
      </text>

      {/* Date row + form notice (right) */}
      <text x={dateRowX} y={dateRowY} fontFamily={FONT_LABEL} fontSize={10} fontWeight={500}>
        {dateStr}
      </text>
      <text x={dateRowX} y={dateRowY + 12} fontFamily={FONT_LABEL} fontSize={8} fill="#555">
        (month / day / year)
      </text>
      <text x={noticeX} y={noticeY + 12} fontFamily={FONT_LABEL} fontSize={8} fill="#555">
        Original – File at home terminal.
      </text>
      <text x={noticeX} y={noticeY + 22} fontFamily={FONT_LABEL} fontSize={8} fill="#555">
        Duplicate – Driver retains in their possession for 8 days.
      </text>

      {/* From / To */}
      <FieldRow
        x={SIDE_MARGIN}
        y={fromY}
        label="From:"
        value={fromCompact}
        width={(CONTENT_WIDTH - 16) / 2}
      />
      <FieldRow
        x={SIDE_MARGIN + (CONTENT_WIDTH - 16) / 2 + 16}
        y={fromY}
        label="To:"
        value={toCompact}
        width={(CONTENT_WIDTH - 16) / 2}
      />

      {/* Total Miles box (single — see comment above). */}
      <MilesBox
        x={leftBoxX}
        y={milesBoxY}
        width={milesBoxWidth}
        height={milesBoxHeight}
        valueLabel="Total Miles Driving Today"
        value={milesStr}
      />

      {/* Carrier / Office / Truck / Home Terminal — a stack of labelled lines */}
      <LabeledLine
        x={carrierStartX}
        y={milesBoxY + 4}
        width={carrierLineWidth}
        label="Name of Carrier or Carriers"
        value={header.carrierName ?? ''}
      />
      <LabeledLine
        x={carrierStartX}
        y={milesBoxY + 26}
        width={carrierLineWidth}
        label="Main Office Address"
        value={header.mainOfficeAddress ?? ''}
      />
      <LabeledLine
        x={carrierStartX}
        y={milesBoxY + 48}
        width={carrierLineWidth}
        label="Home Terminal Address"
        value={header.homeTerminalAddress ?? ''}
      />

      {/* Truck/Trailer + Driver/Co-driver row, below the boxes */}
      <LabeledLine
        x={SIDE_MARGIN}
        y={milesBoxY + milesBoxHeight + 14}
        width={(CONTENT_WIDTH - 16) / 2}
        label="Truck/Tractor & Trailer Numbers or License Plate(s)/State"
        value={header.truckTrailerInfo ?? ''}
      />
      <LabeledLine
        x={SIDE_MARGIN + (CONTENT_WIDTH - 16) / 2 + 16}
        y={milesBoxY + milesBoxHeight + 14}
        width={((CONTENT_WIDTH - 16) / 2 - 100) / 1}
        label="Driver"
        value={header.driverName ?? ''}
      />
      <LabeledLine
        x={SHEET_WIDTH - SIDE_MARGIN - 100}
        y={milesBoxY + milesBoxHeight + 14}
        width={100}
        label="Co-driver"
        value={header.coDriverName ?? ''}
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Building blocks shared by sub-bands
// ---------------------------------------------------------------------------
interface FieldRowProps {
  x: number
  y: number
  label: string
  value: string
  width: number
}

function FieldRow({ x, y, label, value, width }: FieldRowProps) {
  const labelWidth = 38
  return (
    <g>
      <text x={x} y={y + 9} fontFamily={FONT_LABEL} fontSize={10} fontWeight={500}>
        {label}
      </text>
      <line
        x1={x + labelWidth}
        y1={y + 11}
        x2={x + width}
        y2={y + 11}
        stroke={INK}
        strokeWidth={HAIRLINE}
      />
      <text x={x + labelWidth + 4} y={y + 9} fontFamily={FONT_LABEL} fontSize={10}>
        {value}
      </text>
    </g>
  )
}

interface LabeledLineProps {
  x: number
  y: number
  width: number
  label: string
  value: string
}

function LabeledLine({ x, y, width, label, value }: LabeledLineProps) {
  return (
    <g>
      <text x={x + 4} y={y + 8} fontFamily={FONT_LABEL} fontSize={10}>
        {value}
      </text>
      <line
        x1={x}
        y1={y + 12}
        x2={x + width}
        y2={y + 12}
        stroke={INK}
        strokeWidth={HAIRLINE}
      />
      <text x={x + 4} y={y + 22} fontFamily={FONT_LABEL} fontSize={8} fill="#555">
        {label}
      </text>
    </g>
  )
}

interface MilesBoxProps {
  x: number
  y: number
  width: number
  height: number
  valueLabel: string
  value: string
}

function MilesBox({ x, y, width, height, valueLabel, value }: MilesBoxProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#fff"
        stroke={INK}
        strokeWidth={BORDER}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + 2}
        fontFamily={FONT_NUMBER}
        fontSize={20}
        fontWeight={500}
        textAnchor="middle"
      >
        {value}
      </text>
      <text
        x={x + width / 2}
        y={y + height + 12}
        fontFamily={FONT_LABEL}
        fontSize={9}
        textAnchor="middle"
      >
        {valueLabel}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Remarks band
// ---------------------------------------------------------------------------
interface RemarksBandProps {
  dutyChanges: DutyChangeLabel[]
}

function RemarksBand({ dutyChanges }: RemarksBandProps) {
  const bandTop = REMARKS_TOP
  const bandBottom = REMARKS_TOP + REMARKS_HEIGHT

  return (
    <g>
      {/* Bottom border of the band (subtle hairline that frames the
          shipping section below). */}
      <line
        x1={SIDE_MARGIN}
        y1={bandBottom - 6}
        x2={SHEET_WIDTH - SIDE_MARGIN}
        y2={bandBottom - 6}
        stroke={INK}
        strokeWidth={HAIRLINE}
      />

      {/* Section heading — left-aligned, doesn't compete with the
          horizontal labels that flow across the band. */}
      <text
        x={SIDE_MARGIN}
        y={bandTop + 14}
        fontFamily={FONT_LABEL}
        fontSize={10}
        fontWeight={700}
        fill={INK}
      >
        Remarks
      </text>

      {/* Each duty change: a vertical connector tick from the chart
          bottom down to the label's row, then a horizontal label
          centred on the column. Rows stagger so labels never overlap. */}
      {dutyChanges.map((change, i) => {
        const labelBaselineY =
          bandTop + REMARK_FIRST_ROW_DY + change.rowIndex * REMARK_LABEL_ROW_GAP
        return (
          <g key={i}>
            <line
              x1={change.sheetX}
              y1={bandTop}
              x2={change.sheetX}
              y2={labelBaselineY - REMARK_LABEL_FONT_SIZE - 1}
              stroke={INK}
              strokeWidth={HAIRLINE}
            />
            <text
              x={change.sheetX}
              y={labelBaselineY}
              textAnchor="middle"
              fontFamily={FONT_LABEL}
              fontSize={REMARK_LABEL_FONT_SIZE}
              fill={INK}
            >
              {change.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Shipping documents band
// ---------------------------------------------------------------------------
interface ShippingBandProps {
  log: DailyLog
}

function ShippingBand({ log }: ShippingBandProps) {
  const top = SHIPPING_TOP
  const left = SIDE_MARGIN
  const right = SHEET_WIDTH - SIDE_MARGIN
  const labelLineWidth = (right - left) / 2 - 16

  return (
    <g fill={INK}>
      <text x={left} y={top + 14} fontFamily={FONT_LABEL} fontSize={11} fontWeight={700}>
        Shipping Documents
      </text>

      <LabeledLine
        x={left}
        y={top + 24}
        width={labelLineWidth}
        label="DVL or Manifest No."
        value=""
      />
      <LabeledLine
        x={left + labelLineWidth + 32}
        y={top + 24}
        width={labelLineWidth}
        label="Shipper & Commodity"
        value=""
      />

      <text
        x={left}
        y={top + 80}
        fontFamily={FONT_LABEL}
        fontSize={9}
        fill="#555"
      >
        Enter the name of the place you reported and where released from work, and
        when and where each change of duty occurred.
      </text>
      <text
        x={left}
        y={top + 94}
        fontFamily={FONT_LABEL}
        fontSize={9}
        fill="#555"
      >
        Use time standard of home terminal: {compactLocation(log.from_label) || '—'} → {compactLocation(log.to_label) || '—'}.
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Recap band
// ---------------------------------------------------------------------------
interface RecapBandProps {
  onDutyToday: number
  totals: Record<DutyStatus, number>
  cumulative?: DailyLogSheetCumulative
  requires34hRestart: boolean
}

function RecapBand({ onDutyToday, totals, cumulative, requires34hRestart }: RecapBandProps) {
  const top = RECAP_TOP
  const left = SIDE_MARGIN
  const right = SHEET_WIDTH - SIDE_MARGIN
  const colWidth = (right - left) / 4

  const cycle70A = cumulative?.onDutyLast7Days
  const cycle70B = cycle70A === undefined ? undefined : Math.max(0, HOURS_PER_CYCLE_70 - cycle70A)
  const cycle70C = cumulative?.onDutyLast5Days

  const cycle60A = cumulative?.onDutyLast8Days
  const cycle60B = cycle60A === undefined ? undefined : Math.max(0, HOURS_PER_CYCLE_60 - cycle60A)
  const cycle60C = cumulative?.onDutyLast5Days

  return (
    <g fill={INK}>
      <line
        x1={left}
        y1={top}
        x2={right}
        y2={top}
        stroke={INK}
        strokeWidth={HAIRLINE}
      />

      <text x={left} y={top + 18} fontFamily={FONT_LABEL} fontSize={11} fontWeight={700}>
        Recap — complete at end of day
      </text>

      <RecapRow
        y={top + 36}
        title="On-duty hours today (lines 3 + 4)"
        value={formatHours(onDutyToday)}
      />
      <RecapRow
        y={top + 56}
        title="Off-duty + sleeper hours today (lines 1 + 2)"
        value={formatHours(totals.OFF + totals.SB)}
      />

      {/* 70 hr / 8 day section */}
      <CycleBlock
        x={left}
        y={top + 90}
        title="70-hour / 8-day drivers"
        a={cycle70A}
        b={cycle70B}
        c={cycle70C}
        cycleHours={HOURS_PER_CYCLE_70}
        colWidth={colWidth}
      />

      {/* 60 hr / 7 day section */}
      <CycleBlock
        x={left}
        y={top + 178}
        title="60-hour / 7-day drivers"
        a={cycle60A}
        b={cycle60B}
        c={cycle60C}
        cycleHours={HOURS_PER_CYCLE_60}
        colWidth={colWidth}
      />

      <text
        x={left}
        y={top + 270}
        fontFamily={FONT_LABEL}
        fontSize={9}
        fill="#555"
      >
        * If you took 34 consecutive hours off duty, you have 60/70 hours available.
      </text>

      {requires34hRestart ? (
        <g transform={`translate(${right - 200}, ${top + 252})`}>
          <rect
            x={0}
            y={0}
            width={200}
            height={28}
            fill="#fff8d6"
            stroke="#a06a00"
            strokeWidth={BORDER}
            rx={4}
          />
          <text
            x={100}
            y={18}
            fontFamily={FONT_LABEL}
            fontSize={11}
            fontWeight={500}
            textAnchor="middle"
            fill="#664400"
          >
            34-hr restart inserted
          </text>
        </g>
      ) : null}
    </g>
  )
}

interface RecapRowProps {
  y: number
  title: string
  value: string
}

function RecapRow({ y, title, value }: RecapRowProps) {
  return (
    <g>
      <text x={SIDE_MARGIN + 4} y={y} fontFamily={FONT_LABEL} fontSize={10}>
        {title}
      </text>
      <text
        x={SHEET_WIDTH - SIDE_MARGIN - 4}
        y={y}
        fontFamily={FONT_NUMBER}
        fontSize={11}
        fontWeight={500}
        textAnchor="end"
      >
        {value}
      </text>
    </g>
  )
}

interface CycleBlockProps {
  x: number
  y: number
  title: string
  a?: number
  b?: number
  c?: number
  cycleHours: number
  colWidth: number
}

function CycleBlock({ x, y, title, a, b, c, cycleHours, colWidth }: CycleBlockProps) {
  // Vertical rhythm:
  //   y + 12  block title baseline
  //   y + 32  A./B./C. label baseline
  //   y + 52  value baseline (e.g. "11:30")
  //   y + 56  field underline (4 px below value baseline — was previously
  //           crossing through the digits; this is the strikethrough fix)
  //   y + 72  caption baseline
  const titleY = y + 12
  const labelY = y + 32
  const valueY = y + 52
  const underlineY = y + 56
  const captionY = y + 72

  const cells: Array<{ label: string; caption: string; value: ReactNode }> = [
    {
      label: 'A.',
      caption: `Total hours on duty last ${cycleHours === HOURS_PER_CYCLE_70 ? '7' : '8'} days (incl. today)`,
      value: formatHours(a),
    },
    {
      label: 'B.',
      caption: `Hours available tomorrow (${cycleHours} − A*)`,
      value: formatHours(b),
    },
    {
      label: 'C.',
      caption: 'Total hours on duty last 5 days (incl. today)',
      value: formatHours(c),
    },
  ]

  return (
    <g>
      <text x={x} y={titleY} fontFamily={FONT_LABEL} fontSize={10} fontWeight={700}>
        {title}
      </text>
      {cells.map((cell, i) => {
        const cx = x + colWidth * (i + 1) - colWidth + 16
        return (
          <g key={cell.label}>
            <text x={cx} y={labelY} fontFamily={FONT_LABEL} fontSize={10} fontWeight={700}>
              {cell.label}
            </text>
            <text x={cx + 22} y={valueY} fontFamily={FONT_NUMBER} fontSize={12} fontWeight={500}>
              {cell.value}
            </text>
            <line
              x1={cx + 18}
              y1={underlineY}
              x2={cx + colWidth - 32}
              y2={underlineY}
              stroke={INK}
              strokeWidth={HAIRLINE}
            />
            <text x={cx} y={captionY} fontFamily={FONT_LABEL} fontSize={8} fill="#555">
              {cell.caption}
            </text>
          </g>
        )
      })}
    </g>
  )
}
