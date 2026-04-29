/**
 * Segmented control for the three Daily-Log view variants:
 *   Modern   — color-coded FMCSA grid (default)
 *   Compact  — one row per day, useful for multi-day overview
 *   Classic  — black-and-white facsimile of the carbon-paper form
 */
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

export type LogView = 'modern' | 'compact' | 'classic'

interface LogViewToggleProps {
  value: LogView
  onChange: (next: LogView) => void
}

export function LogViewToggle({ value, onChange }: LogViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      aria-label="Log view"
      onChange={(_, next: LogView | null) => {
        if (next) onChange(next)
      }}
      sx={{
        p: 0.375,
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? '#ECEFF3' : 'rgba(255,255,255,0.06)',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          height: 30,
          px: 1.5,
          fontSize: 12.5,
          fontWeight: 500,
          color: 'text.secondary',
          borderRadius: '6px !important',
          '&.Mui-selected': {
            backgroundColor: 'background.paper',
            color: 'primary.dark',
            boxShadow: 1,
            '&:hover': { backgroundColor: 'background.paper' },
          },
        },
      }}
    >
      <ToggleButton value="modern">Modern</ToggleButton>
      <ToggleButton value="compact">Compact</ToggleButton>
      <ToggleButton value="classic">Classic paper</ToggleButton>
    </ToggleButtonGroup>
  )
}
