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

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

export function formatTime(iso: string): string {
  return TIME_FORMATTER.format(new Date(iso))
}

const US_STATE_ABBREVIATIONS: Readonly<Record<string, string>> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME',
  Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE',
  Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
  Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY',
}

/**
 * Collapse a verbose Nominatim label down to "City, ST".
 *
 * Nominatim returns strings like
 *   "Los Angeles, Los Angeles County, California, United States"
 * which crowd the daily-log remarks band. This drops the country tail,
 * keeps the leading city, and abbreviates a recognised US state when
 * one appears anywhere in the rest. Pre-coined labels with no comma
 * ("En route", "Origin", "Fuel stop", …) pass through unchanged.
 */
export function compactLocation(label: string): string {
  if (!label) return ''
  if (!label.includes(',')) return label
  const parts = label.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return label
  const filtered = parts.filter((p) => p !== 'United States' && p !== 'USA')
  if (filtered.length === 0) return parts[0]
  const city = filtered[0]
  for (let i = filtered.length - 1; i > 0; i--) {
    const abbr = US_STATE_ABBREVIATIONS[filtered[i]]
    if (abbr) return `${city}, ${abbr}`
  }
  return `${city}, ${filtered[filtered.length - 1]}`
}
