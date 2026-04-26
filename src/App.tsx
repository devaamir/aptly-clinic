import type { FC } from 'react'
import { useState, useEffect } from 'react'
import Auth from './pages/Auth'
import SelectProfile from './pages/SelectProfile'
import Dashboard from './pages/Dashboard'
import DeleteAccount from './pages/DeleteAccount'
import type { UserContext } from './services/types'

type AppScreen = 'auth' | 'select-profile' | 'dashboard' | 'delete-account'

const App: FC = () => {
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (window.location.pathname === '/delete-account') return 'delete-account'
    return localStorage.getItem('accessToken') ? 'dashboard' : 'auth'
  })

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/delete-account') {
        setScreen('delete-account')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleLogin = () => setScreen('select-profile')

  const handleSelectProfile = (ctx: UserContext) => {
    localStorage.setItem('selectedRole', ctx.role)
    localStorage.setItem('selectedClinic', JSON.stringify(ctx.medicalCenter))
    setScreen('dashboard')
  }

  if (screen === 'delete-account') return <DeleteAccount />
  if (screen === 'dashboard') return <Dashboard />
  if (screen === 'select-profile') return <SelectProfile onSelect={handleSelectProfile} />
  return <Auth onLogin={handleLogin} />
}

export default App
