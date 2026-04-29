/**
 * <LocationAutocomplete /> — searchable location picker backed by
 * `GET /api/geocode/`.
 *
 * Single responsibility: render an MUI Autocomplete that lets the user
 * search Nominatim and pick a `{label, lat, lng}` option. Network state
 * (debounce + fetch + cache) lives in `useGeocodeSearch`; this file is
 * pure presentation + form glue.
 *
 * Implementation notes:
 * - MUI manages the visible input value (it derives it from ``value``
 *   automatically). We only track what the *user* typed for the search
 *   hook — by filtering on ``reason === 'input'`` we avoid spurious
 *   network calls when the parent resets or programmatically picks.
 * - ``filterOptions={(x) => x}`` disables MUI's client-side filtering
 *   so the list always reflects the server response.
 * - Pin + letter adornments mirror the existing form so the visual
 *   rhythm is preserved when the field replaces the old plain TextField.
 */
import { forwardRef, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  MIN_GEOCODE_QUERY_LENGTH,
  useGeocodeSearch,
} from '@/hooks/useGeocodeSearch'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { LocationOption } from '@/lib/tripInput'

const DEBOUNCE_MS = 300

export interface LocationAutocompleteProps {
  value: LocationOption | null
  onChange: (next: LocationOption | null) => void
  onBlur?: () => void
  label: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  /** Tighter density to match the compact form variant. */
  compact?: boolean
}

export const LocationAutocomplete = forwardRef<
  HTMLInputElement,
  LocationAutocompleteProps
>(function LocationAutocomplete(
  {
    value,
    onChange,
    onBlur,
    label,
    placeholder,
    error,
    disabled,
    required,
    autoFocus,
    startAdornment,
    endAdornment,
    compact,
  },
  ref,
) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebouncedValue(searchQuery, DEBOUNCE_MS)
  const { data, isFetching } = useGeocodeSearch({ query: debouncedQuery })
  const options = data ?? []

  return (
    <Autocomplete<LocationOption, false, false, false>
      value={value}
      onChange={(_event, next) => onChange(next)}
      onBlur={onBlur}
      onInputChange={(_event, next, reason) => {
        if (reason === 'input') setSearchQuery(next)
      }}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) =>
        a.lat === b.lat && a.lng === b.lng && a.label === b.label
      }
      filterOptions={(opts) => opts}
      noOptionsText={
        searchQuery.trim().length < MIN_GEOCODE_QUERY_LENGTH
          ? 'Type to search'
          : isFetching
            ? 'Searching…'
            : 'No matches'
      }
      loading={isFetching}
      loadingText="Searching…"
      disabled={disabled}
      autoHighlight
      blurOnSelect
      slotProps={{ paper: { sx: { boxShadow: 6 } } }}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={`${option.lat},${option.lng},${option.label}`}
        >
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {primaryLabel(option.label)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {secondaryLabel(option)}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={ref}
          label={label}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={error ?? (compact ? '' : ' ')}
          autoComplete="off"
          autoFocus={autoFocus}
          required={required}
          fullWidth
          size={compact ? 'small' : 'medium'}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment:
                startAdornment ?? params.slotProps.input.startAdornment,
              endAdornment: (
                <>
                  {isFetching ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                      sx={{ mr: 1 }}
                      aria-label="Searching"
                    />
                  ) : null}
                  {endAdornment}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  )
})

/**
 * Nominatim labels are comma-separated strings ordered most-specific →
 * least-specific. The first segment is the place name; the rest is
 * supporting context that we render separately so the dropdown row
 * doesn't truncate the bit users care about.
 */
function primaryLabel(label: string): string {
  const idx = label.indexOf(',')
  return idx === -1 ? label : label.slice(0, idx)
}

function secondaryLabel(option: LocationOption): string {
  const idx = option.label.indexOf(',')
  const context = idx === -1 ? '' : option.label.slice(idx + 1).trim()
  const coords = `${option.lat.toFixed(3)}, ${option.lng.toFixed(3)}`
  return context ? `${context} · ${coords}` : coords
}
