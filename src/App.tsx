import type { FC } from 'react'
import { useState } from 'react'
import Auth from './pages/Auth'
import SelectProfile from './pages/SelectProfile'
import Dashboard from './pages/Dashboard'
import type { UserContext } from './services/types'

type AppScreen = 'auth' | 'select-profile' | 'dashboard'

const App: FC = () => {
  const [screen, setScreen] = useState<AppScreen>(
    localStorage.getItem('accessToken') ? 'dashboard' : 'auth'
  )

  const handleLogin = () => setScreen('select-profile')

  const handleSelectProfile = (ctx: UserContext) => {
    localStorage.setItem('selectedRole', ctx.role)
    localStorage.setItem('selectedClinic', JSON.stringify(ctx.medicalCenter))
    setScreen('dashboard')
  }

  if (screen === 'dashboard') return <Dashboard />
  if (screen === 'select-profile') return <SelectProfile onSelect={handleSelectProfile} />
  return <Auth onLogin={handleLogin} />
}

export default App
