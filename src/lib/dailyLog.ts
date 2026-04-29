/**
 * Shared helpers for the three Daily-Log view variants (Modern, Compact,
 * Classic paper). Each variant renders the same DailyLog payload — these
 * helpers normalise the per-status totals and the HH:MM formatter that
 * all three variants need.
 */
import type { DailyLog, DutyStatus } from '@/lib/trip'

export function totalsFromLog(log: DailyLog): Record<DutyStatus, number> {
  return {
    OFF: log.total_off_duty,
    SB: log.total_sleeper,
    D: log.total_driving,
    ON: log.total_on_duty,
  }
}

export function formatHours(hours: number | undefined): string {
  if (hours === undefined || Number.isNaN(hours)) return '—'
  const totalMinutes = Math.max(0, Math.round(hours * 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatLogDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

const ROW_INDEX: Record<DutyStatus, number> = { OFF: 0, SB: 1, D: 2, ON: 3 }

/**
 * Build a duty-status polyline path scaled to a viewBox. Used by the
 * Compact and Classic variants — the Modern variant builds its polyline
 * inside DutyStatusGrid using its own coordinate system.
 */
export function dutyPath(
  segments: Array<{ start_hr: number; end_hr: number; duty_status: DutyStatus }>,
  gridLeft: number,
  gridTop: number,
  hourW: number,
  rowH: number,
): string {
  const pts: string[] = []
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    const y = gridTop + ROW_INDEX[s.duty_status] * rowH + rowH / 2
    if (i === 0) pts.push(`${gridLeft + s.start_hr * hourW},${y}`)
    else if (segments[i - 1].duty_status !== s.duty_status) {
      pts.push(`${gridLeft + s.start_hr * hourW},${y}`)
    }
    pts.push(`${gridLeft + s.end_hr * hourW},${y}`)
  }
  return pts.join(' ')
}

export const DUTY_STATUS_ROW_INDEX = ROW_INDEX
