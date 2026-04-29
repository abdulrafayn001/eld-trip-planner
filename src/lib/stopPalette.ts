/**
 * Single source of truth for stop-type colors. Used by the map markers
 * (TripMap) and the itinerary timeline (TripItineraryTrack) so a stop
 * keeps the same hue across both surfaces.
 */

export type StopActivity =
  | 'Pre-trip inspection'
  | 'Post-trip inspection'
  | 'Pickup'
  | 'Drop-off'
  | '30-min break'
  | 'Fueling'
  | '10-hr daily reset'
  | '34-hr restart'

export interface StopPaletteEntry {
  /** Solid fill — used for map marker circles and timeline pip backgrounds. */
  fill: string
  /** Foreground (icon) color rendered on top of `fill`. */
  on: string
  /** Border color matching the fill family. */
  border: string
}

const FALLBACK: StopPaletteEntry = {
  fill: '#5f6368',
  on: '#ffffff',
  border: '#5f6368',
}

const PALETTE: Record<string, StopPaletteEntry> = {
  'Pre-trip inspection': { fill: '#4f46e5', on: '#ffffff', border: '#4f46e5' },
  'Post-trip inspection': { fill: '#475569', on: '#ffffff', border: '#475569' },
  Pickup: { fill: '#f59e0b', on: '#1f1300', border: '#f59e0b' },
  'Drop-off': { fill: '#10b981', on: '#04231a', border: '#10b981' },
  '30-min break': { fill: '#0ea5e9', on: '#ffffff', border: '#0ea5e9' },
  Fueling: { fill: '#ef4444', on: '#ffffff', border: '#ef4444' },
  '10-hr daily reset': { fill: '#8b5cf6', on: '#ffffff', border: '#8b5cf6' },
  '34-hr restart': { fill: '#06b6d4', on: '#04282e', border: '#06b6d4' },
}

export function paletteFor(activity: string): StopPaletteEntry {
  return PALETTE[activity] ?? FALLBACK
}
