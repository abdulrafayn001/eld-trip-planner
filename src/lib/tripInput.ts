/**
 * Trip-input shape — single source of truth for the create-trip form.
 *
 * Owns the zod schema + derived TS types, the sample-trip constant, and
 * localStorage persistence helpers (read/write under `eld:last-trip-input`).
 *
 * Locations are picked from the autocomplete dropdown backed by
 * `GET /api/geocode/`, so the form stores `{label, lat, lng}` rather than
 * raw text — the backend trusts this and skips its own geocoding step.
 *
 * Two derived types intentionally diverge:
 *
 * - `TripFormValues` (zod input)  — locations may be `null` while the user
 *   is still picking. This is the shape react-hook-form holds in state.
 * - `TripInput` (zod output)      — post-validation; all locations are
 *   guaranteed non-null. This is what the submit handler can send.
 */
import { z } from 'zod'

const REQUIRED = 'Pick a location'

export const locationOptionSchema = z.object({
  label: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type LocationOption = z.infer<typeof locationOptionSchema>

const requiredLocation = locationOptionSchema
  .nullable()
  .refine((v): v is LocationOption => v !== null, { message: REQUIRED })

export const tripInputSchema = z.object({
  current: requiredLocation,
  pickup: requiredLocation,
  dropoff: requiredLocation,
  cycle_used_hrs: z
    .number()
    .min(0, 'Cycle used must be at least 0')
    .max(70, 'Cycle used must be at most 70'),
})

export type TripFormValues = z.input<typeof tripInputSchema>
export type TripInput = z.output<typeof tripInputSchema>

export const EMPTY_TRIP_INPUT: TripFormValues = {
  current: null,
  pickup: null,
  dropoff: null,
  cycle_used_hrs: 0,
}

export const SAMPLE_TRIP_INPUT: TripFormValues = {
  current: { label: 'Los Angeles, CA, USA', lat: 34.0537, lng: -118.2428 },
  pickup: { label: 'Dallas, TX, USA', lat: 32.7767, lng: -96.797 },
  dropoff: { label: 'Atlanta, GA, USA', lat: 33.749, lng: -84.388 },
  cycle_used_hrs: 20,
}

const STORAGE_KEY = 'eld:last-trip-input'

const persistedSchema = z.object({
  current: locationOptionSchema.nullable(),
  pickup: locationOptionSchema.nullable(),
  dropoff: locationOptionSchema.nullable(),
  cycle_used_hrs: z.number().min(0).max(70),
})

export function loadLastTripInput(): TripFormValues | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = persistedSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveLastTripInput(input: TripFormValues): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
}
