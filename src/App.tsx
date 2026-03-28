import type { FC } from 'react'
import { useState } from 'react'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

type AppScreen = 'auth' | 'dashboard'

const App: FC = () => {
  const [screen, setScreen] = useState<AppScreen>('auth')

  if (screen === 'dashboard') return <Dashboard />
  return <Auth onLogin={() => setScreen('dashboard')} />
}

export default App
