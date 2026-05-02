import type { FC } from 'react'
import { useState, useEffect } from 'react'
import Auth from './pages/Auth'
import SelectProfile from './pages/SelectProfile'
import Dashboard from './pages/Dashboard'
import DeleteAccount from './pages/DeleteAccount'
import SetPassword from './pages/SetPassword'
import CreateClinic from './pages/CreateClinic'
import type { UserContext } from './services/types'

type AppScreen = 'auth' | 'select-profile' | 'dashboard' | 'delete-account' | 'set-password' | 'create-clinic'

const App: FC = () => {
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (window.location.pathname === '/delete-account') return 'delete-account'
    if (window.location.pathname === '/set-password') return 'set-password'
    if (localStorage.getItem('pendingClinicSetup') === 'true') return 'create-clinic'
    return localStorage.getItem('accessToken') ? 'dashboard' : 'auth'
  })

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/delete-account') {
        setScreen('delete-account')
      } else if (window.location.pathname === '/set-password') {
        setScreen('set-password')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleLogin = (isNewAccount: boolean) => {
    if (isNewAccount) {
      localStorage.setItem('pendingClinicSetup', 'true')
      setScreen('create-clinic')
      return
    }
    setScreen('select-profile')
  }

  const handleClinicCreated = () => {
    localStorage.removeItem('pendingClinicSetup')
    setScreen('select-profile')
  }

  const handleSelectProfile = (ctx: UserContext) => {
    localStorage.setItem('selectedRole', ctx.role)
    localStorage.setItem('selectedClinic', JSON.stringify(ctx.medicalCenter))
    setScreen('dashboard')
  }

  if (screen === 'delete-account') return <DeleteAccount />
  if (screen === 'set-password') return <SetPassword />
  if (screen === 'create-clinic') return <CreateClinic onCreated={handleClinicCreated} onBack={() => { localStorage.removeItem('pendingClinicSetup'); setScreen('auth') }} />
  if (screen === 'dashboard') return <Dashboard />
  if (screen === 'select-profile') return <SelectProfile onSelect={handleSelectProfile} />
  return <Auth onLogin={handleLogin} />
}

export default App
