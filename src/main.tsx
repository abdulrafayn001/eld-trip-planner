import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { SnackbarProvider } from 'notistack'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { ThemeModeProvider } from '@/theme/ThemeModeProvider'
import { router } from '@/routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <RouterProvider router={router} />
      </SnackbarProvider>
    </ThemeModeProvider>
  </StrictMode>,
)
