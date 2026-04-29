/**
 * Presentation formatters shared across trip-detail components.
 *
 * Module-level `Intl.NumberFormat` singletons — building one on every
 * call would cost a few hundred microseconds per render; keeping them
 * here is both faster and the canonical pattern.
 */

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

export function formatMiles(miles: number): string {
  return `${INTEGER_FORMATTER.format(miles)} mi`
}

export function formatDuration(totalHours: number): string {
  const totalMinutes = Math.max(0, Math.round(totalHours * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatLogDays(count: number): string {
  return `${INTEGER_FORMATTER.format(count)} ${count === 1 ? 'day' : 'days'}`
}
