/**
 * Trip-input shape — single source of truth for the create-trip form.
 *
 * Owns the zod schema + derived TS type, the sample-trip constant, and
 * localStorage persistence helpers (read/write under `eld:last-trip-input`).
 * Form, sample card, and create-trip mutation all import from here so the
 * shape is defined exactly once.
 */
import { z } from 'zod'

const REQUIRED = 'This field is required'

export const tripInputSchema = z.object({
  current: z.string().trim().min(1, REQUIRED),
  pickup: z.string().trim().min(1, REQUIRED),
  dropoff: z.string().trim().min(1, REQUIRED),
  cycle_used_hrs: z
    .number()
    .min(0, 'Cycle used must be at least 0')
    .max(70, 'Cycle used must be at most 70'),
})

export type TripInput = z.infer<typeof tripInputSchema>

export const EMPTY_TRIP_INPUT: TripInput = {
  current: '',
  pickup: '',
  dropoff: '',
  cycle_used_hrs: 0,
}

export const SAMPLE_TRIP_INPUT: TripInput = {
  current: 'Los Angeles, CA',
  pickup: 'Dallas, TX',
  dropoff: 'Atlanta, GA',
  cycle_used_hrs: 20,
}

const STORAGE_KEY = 'eld:last-trip-input'

export function loadLastTripInput(): TripInput | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = tripInputSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveLastTripInput(input: TripInput): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
}
