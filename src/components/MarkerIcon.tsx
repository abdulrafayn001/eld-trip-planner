/**
 * Builds a Leaflet `divIcon` from an `@mui/icons-material` component.
 *
 * Single responsibility: render the icon HTML once and return a Leaflet
 * `DivIcon`. Activity-to-icon dispatch lives in the consumer (TripMap)
 * so this helper stays generic and reusable.
 */
import type { ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import type { SvgIconProps } from '@mui/material/SvgIcon'

export type MuiIconComponent = ComponentType<SvgIconProps>

interface CreateMarkerIconOptions {
  Icon: MuiIconComponent
  color: string
  size?: number
}

const DEFAULT_SIZE = 32

export function createMarkerIcon({
  Icon,
  color,
  size = DEFAULT_SIZE,
}: CreateMarkerIconOptions): L.DivIcon {
  const html = renderToStaticMarkup(
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
        border: '2px solid #fff',
      }}
    >
      <Icon style={{ color: '#fff', fontSize: Math.round(size * 0.55) }} />
    </div>,
  )

  return L.divIcon({
    html,
    className: 'eld-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}
