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
- React Router 7 + Notistack (toasts)
- TanStack Query 5 for server state
- Auth: DRF token in `localStorage` under `eld:auth-token`,
  injected by the api client as `Authorization: Token <key>`
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

## Project layout

```
src/
├── App.tsx               # layout: <AppHeader /> + <Outlet />
├── main.tsx              # provider stack + RouterProvider
├── routes.tsx            # createBrowserRouter route table
├── index.css             # minimal globals (MUI CssBaseline handles reset)
├── theme/                # getTheme + ThemeModeProvider + useThemeMode
├── components/           # AppHeader (more land per phase)
├── pages/                # HomePage, TripPage
└── lib/                  # api client, query client, auth-token storage
```

Phases land one feature per commit per the project build plan.
