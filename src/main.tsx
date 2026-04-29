import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { SnackbarProvider } from 'notistack'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import 'leaflet/dist/leaflet.css'
import { AuthProvider } from '@/auth/AuthContext'
import { ThemeModeProvider } from '@/theme/ThemeModeProvider'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'
import './index.css'
import './styles/print.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeModeProvider>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <RouterProvider router={router} />
          </SnackbarProvider>
        </ThemeModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
