import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import FreeBreakfast from '@mui/icons-material/FreeBreakfast'
import Hotel from '@mui/icons-material/Hotel'
import LocalGasStation from '@mui/icons-material/LocalGasStation'
import LocalShipping from '@mui/icons-material/LocalShipping'
import Place from '@mui/icons-material/Place'
import Restore from '@mui/icons-material/Restore'
import { createMarkerIcon } from '@/components/MarkerIcon'
import { TripItineraryTrack } from '@/components/TripItineraryTrack'
import { formatDuration, formatTime } from '@/lib/format'
import { paletteFor } from '@/lib/stopPalette'
import type { Trip, TripEvent } from '@/lib/trip'

interface TripMapProps {
  trip: Trip
  /**
   * Layout variant.
   * - `default`: full Card with map + itinerary key-stops timeline.
   * - `compact`: bare map filling the parent container; no itinerary, no
   *   surrounding card chrome. Used by the Plan-preview pane and the
   *   split Trip-detail view that renders its own itinerary card.
   */
  compact?: boolean
}

interface MarkerInfo {
  event: TripEvent
  lat: number
  lng: number
  durationHours: number
  cumulativeHours: number
}

// Map shrinks on phones so the route + log sheets aren't pushed below
// the fold. Spec §8.7 sets the floor at 320 px on small screens.
const MAP_HEIGHT = { xs: 320, sm: 380, md: 480 }
const ROUTE_COLOR = '#1f6feb'
const FALLBACK_COLOR = '#5f6368'
const HOUR_MS = 60 * 60 * 1000

// Module-level icon registry — `renderToStaticMarkup` runs eight times at
// load, never per render. Each activity gets its own hue from the shared
// stop palette so map markers visually match the itinerary timeline.
const ACTIVITY_ICONS: Record<string, L.DivIcon> = {
  'Pre-trip inspection': createMarkerIcon({ Icon: LocalShipping, color: paletteFor('Pre-trip inspection').fill }),
  'Post-trip inspection': createMarkerIcon({ Icon: LocalShipping, color: paletteFor('Post-trip inspection').fill }),
  Pickup: createMarkerIcon({ Icon: LocalShipping, color: paletteFor('Pickup').fill }),
  'Drop-off': createMarkerIcon({ Icon: LocalShipping, color: paletteFor('Drop-off').fill }),
  '30-min break': createMarkerIcon({ Icon: FreeBreakfast, color: paletteFor('30-min break').fill }),
  Fueling: createMarkerIcon({ Icon: LocalGasStation, color: paletteFor('Fueling').fill }),
  '10-hr daily reset': createMarkerIcon({ Icon: Hotel, color: paletteFor('10-hr daily reset').fill }),
  '34-hr restart': createMarkerIcon({ Icon: Restore, color: paletteFor('34-hr restart').fill }),
}
const DEFAULT_ICON = createMarkerIcon({ Icon: Place, color: FALLBACK_COLOR })

function iconForActivity(activity: string): L.DivIcon {
  return ACTIVITY_ICONS[activity] ?? DEFAULT_ICON
}

function isMarkerEvent(e: TripEvent): boolean {
  return e.duty_status !== 'D' && e.lat !== null && e.lng !== null
}

export function TripMap({ trip, compact = false }: TripMapProps) {
  const positions = useMemo<L.LatLngTuple[]>(
    () =>
      trip.route_geometry.coordinates.map<L.LatLngTuple>(([lng, lat]) => [lat, lng]),
    [trip.route_geometry],
  )

  const markers = useMemo<MarkerInfo[]>(() => {
    if (trip.events.length === 0) return []
    const tripStartMs = new Date(trip.events[0].start_time).getTime()
    const out: MarkerInfo[] = []
    for (const e of trip.events) {
      if (!isMarkerEvent(e)) continue
      const startMs = new Date(e.start_time).getTime()
      const endMs = new Date(e.end_time).getTime()
      out.push({
        event: e,
        lat: e.lat as number,
        lng: e.lng as number,
        durationHours: (endMs - startMs) / HOUR_MS,
        cumulativeHours: (startMs - tripStartMs) / HOUR_MS,
      })
    }
    return out
  }, [trip.events])

  const [popover, setPopover] = useState<{ anchorEl: HTMLElement; info: MarkerInfo } | null>(null)
  const closePopover = () => setPopover(null)

  const mapEl = (
    <MapContainer
      style={{ height: '100%', width: '100%' }}
      center={[trip.current_lat, trip.current_lng]}
      zoom={5}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.length > 1 ? (
        <Polyline
          positions={positions}
          pathOptions={{ color: ROUTE_COLOR, weight: 4, opacity: 0.85 }}
        />
      ) : null}
      {markers.map((info) => (
        <TripMarker
          key={info.event.sequence}
          info={info}
          onClick={(anchorEl) => setPopover({ anchorEl, info })}
        />
      ))}
      <FitBoundsOnce positions={positions} />
    </MapContainer>
  )

  if (compact) {
    return (
      <Box sx={{ height: '100%', width: '100%' }}>
        {mapEl}
        <MarkerPopover info={popover?.info ?? null} anchorEl={popover?.anchorEl ?? null} onClose={closePopover} />
      </Box>
    )
  }

  return (
    <Card sx={{ overflow: 'hidden', boxShadow: 2 }}>
      <Box sx={{ height: MAP_HEIGHT }}>{mapEl}</Box>
      <TripItineraryTrack events={trip.events} />
      <MarkerPopover info={popover?.info ?? null} anchorEl={popover?.anchorEl ?? null} onClose={closePopover} />
    </Card>
  )
}

interface TripMarkerProps {
  info: MarkerInfo
  onClick: (anchorEl: HTMLElement) => void
}

function TripMarker({ info, onClick }: TripMarkerProps) {
  return (
    <Marker
      position={[info.lat, info.lng]}
      icon={iconForActivity(info.event.activity)}
      eventHandlers={{
        click: (e) => {
          const el = (e.target as L.Marker).getElement()
          if (el) onClick(el)
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -16]} opacity={1}>
        {info.event.activity}
      </Tooltip>
    </Marker>
  )
}

function FitBoundsOnce({ positions }: { positions: L.LatLngTuple[] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length < 2) return
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] })
  }, [map, positions])
  return null
}

interface MarkerPopoverProps {
  info: MarkerInfo | null
  anchorEl: HTMLElement | null
  onClose: () => void
}

function MarkerPopover({ info, anchorEl, onClose }: MarkerPopoverProps) {
  return (
    <Popover
      open={Boolean(anchorEl && info)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      {info ? (
        <Box sx={{ p: 2, minWidth: 240 }}>
          <Typography variant="subtitle2" component="h3">
            {info.event.activity}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
            {info.event.location_label}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ pt: 0.5 }}
          >
            <PopoverStat label="ETA" value={formatTime(info.event.start_time)} />
            <PopoverStat label="Duration" value={formatDuration(info.durationHours)} />
            <PopoverStat label="Cumulative" value={formatDuration(info.cumulativeHours)} />
          </Stack>
        </Box>
      ) : null}
    </Popover>
  )
}

function PopoverStat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="overline" component="div" color="text.secondary" sx={{ lineHeight: 1.4 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  )
}
