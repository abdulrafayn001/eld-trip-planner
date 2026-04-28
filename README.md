# ELD Trip Planner — Frontend

React 19 + TypeScript SPA for the FMCSA HOS-compliant trip planner.
Backend lives in a separate repo; see the project spec for the full
architecture.

## Live URLs

- App: _TBD (Vercel)_
- API: _TBD (Render)_

## Stack

- Vite 8 + React 19 (React Compiler enabled)
- TypeScript strict mode, path alias `@/*` → `src/*`
- MUI 9 (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`)
  with Emotion as the styling engine
- ESLint flat config

## Development

Requires **Node ≥ 20.19** (Vite 8 / Rolldown).

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
```

## Environment variables

| Name | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend origin (no trailing slash) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (browser-safe) key |

## Project layout

```
src/
├── App.tsx               # root component
├── main.tsx              # ThemeProvider + CssBaseline wiring
├── index.css             # minimal globals (MUI CssBaseline handles reset)
├── theme/
│   └── theme.ts          # createTheme — extended in later phases
├── components/           # feature components (added per phase)
└── lib/                  # framework glue (api client, query client, …)
```

Phases land one feature per commit per the project build plan.
