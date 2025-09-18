import './assets/main.css'

import { createRoot } from 'react-dom/client'
import App from './App'
import { IntegrationProvider } from './providers/IntegrationProvider'
import { modusClient } from '$entities/storage/modusClient'

modusClient.ensure()

createRoot(document.getElementById('root')!).render(
  <IntegrationProvider>
    <App />
  </IntegrationProvider>
)
