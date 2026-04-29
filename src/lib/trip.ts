/**
 * Response shapes for `GET /api/trips/{id}/` (DRF `TripSerializer`).
 *
 * Single source of truth for trip-detail TypeScript types — consumed by
 * the query hook, summary card, and (in later phases) the map and log
 * sheet renderers.
 */

export type DutyStatus = 'OFF' | 'SB' | 'D' | 'ON'

export interface TripEvent {
  sequence: number
  start_time: string
  end_time: string
  duty_status: DutyStatus
  activity: string
  location_label: string
  lat: number | null
  lng: number | null
}

export interface DailyLogSegment {
  start_hr: number
  end_hr: number
  duty_status: DutyStatus
  activity: string
  location_label: string
}

export interface DailyLog {
  date: string
  from_label: string
  to_label: string
  total_miles: number
  total_off_duty: number
  total_sleeper: number
  total_driving: number
  total_on_duty: number
  segments: DailyLogSegment[]
}

export interface RouteGeometry {
  type: 'LineString'
  coordinates: [number, number][]
}

export interface Trip {
  id: string
  user: number | null
  current_location: string
  current_lat: number
  current_lng: number
  pickup_location: string
  pickup_lat: number
  pickup_lng: number
  dropoff_location: string
  dropoff_lat: number
  dropoff_lng: number
  cycle_used_hrs: number
  home_timezone: string
  total_distance_mi: number
  total_duration_hr: number
  route_geometry: RouteGeometry
  requires_34h_restart: boolean
  created_at: string
  events: TripEvent[]
  logs: DailyLog[]
}
