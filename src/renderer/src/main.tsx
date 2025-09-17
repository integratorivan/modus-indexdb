import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { IntegrationProvider } from './providers/IntegrationProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IntegrationProvider>
      <App />
    </IntegrationProvider>
  </StrictMode>
)
