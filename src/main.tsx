import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AppProvider } from './context/AppContext'
import { colors } from './styles/colors'

const rootEl = document.documentElement
Object.entries(colors).forEach(([key, value]) => {
  rootEl.style.setProperty(`--color-${key}`, value)
})

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

createRoot(container).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
