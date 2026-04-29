/**
 * Standalone demo segments for `<DutyStatusGrid />`.
 *
 * Lets the grid be eyeballed without a full trip:
 *
 *   import { DutyStatusGrid } from '@/components/DutyStatusGrid'
 *   import { DEMO_SEGMENTS } from '@/components/DutyStatusGrid.demo'
 *
 *   <DutyStatusGrid segments={DEMO_SEGMENTS} />
 *
 * Lives in its own module (not the component file) so the .tsx file
 * exports only a component — keeping `react-refresh/only-export-components`
 * clean.
 *
 * Durations sum to exactly 24.0 hours.
 */
import type { DailyLogSegment } from '@/lib/trip'

export const DEMO_SEGMENTS: DailyLogSegment[] = [
  { start_hr: 0, end_hr: 6.5, duty_status: 'OFF', activity: 'Off duty', location_label: 'Home terminal' },
  { start_hr: 6.5, end_hr: 6.75, duty_status: 'ON', activity: 'Pre-trip inspection', location_label: 'Origin' },
  { start_hr: 6.75, end_hr: 11.75, duty_status: 'D', activity: 'Driving', location_label: 'En route' },
  { start_hr: 11.75, end_hr: 12.25, duty_status: 'OFF', activity: '30-min break', location_label: 'En route' },
  { start_hr: 12.25, end_hr: 14.25, duty_status: 'D', activity: 'Driving', location_label: 'En route' },
  { start_hr: 14.25, end_hr: 15.25, duty_status: 'ON', activity: 'Pickup', location_label: 'Pickup' },
  { start_hr: 15.25, end_hr: 18.5, duty_status: 'D', activity: 'Driving', location_label: 'En route' },
  { start_hr: 18.5, end_hr: 18.75, duty_status: 'ON', activity: 'Post-trip inspection', location_label: 'Drop-off' },
  { start_hr: 18.75, end_hr: 24, duty_status: 'SB', activity: 'Sleeper berth', location_label: 'Drop-off' },
]
