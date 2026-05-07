import type { FC, ReactNode } from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import type { UserContext, UserMedicalCenter, Speciality, MedicalSystem, Qualification } from '../services/types'
import { getSpecialties, getMedicalSystems, getQualifications } from '../services/api'

interface AuthUser {
  id: string
  name: string
  phoneNumber: string
  emailAddress: string
  role: string
  medicalCenterId: string
}

interface AppContextValue {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
  accessToken: string | null
  refreshToken: string | null
  setTokens: (access: string, refresh: string) => void
  contexts: UserContext[]
  setContexts: (c: UserContext[]) => void
  activeContext: UserContext | null
  setActiveContext: (c: UserContext) => void
  logout: () => void
  specialties: Speciality[]
  medicalSystems: MedicalSystem[]
  qualifications: Qualification[]
}

const AppContext = createContext<AppContextValue>(null!)

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'))
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'))
  const [contexts, setContexts] = useState<UserContext[]>([])
  const [specialties, setSpecialties] = useState<Speciality[]>([])
  const [medicalSystems, setMedicalSystems] = useState<MedicalSystem[]>([])
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [activeContext, setActiveContextState] = useState<UserContext | null>(() => {
    const stored = localStorage.getItem('selectedClinic')
    const role = localStorage.getItem('selectedRole')
    if (stored && role) {
      try { return { role, medicalCenter: JSON.parse(stored) as UserMedicalCenter } } catch { return null }
    }
    return null
  })

  useEffect(() => {
    if (!accessToken) return
    getSpecialties().then(r => { if (r.success) setSpecialties(r.data) }).catch(() => {})
    getMedicalSystems().then(r => { if (r.success) setMedicalSystems(r.data) }).catch(() => {})
    getQualifications().then(r => { if (r.success) setQualifications(r.data) }).catch(() => {})
  }, [accessToken])

  const setTokens = (access: string, refresh: string) => {
    setAccessToken(access)
    setRefreshToken(refresh)
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  const setActiveContext = (ctx: UserContext) => {
    setActiveContextState(ctx)
    localStorage.setItem('selectedRole', ctx.role)
    localStorage.setItem('selectedClinic', JSON.stringify(ctx.medicalCenter))
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setContexts([])
    setSpecialties([])
    setMedicalSystems([])
    setQualifications([])
    setActiveContextState(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('selectedRole')
    localStorage.removeItem('selectedClinic')
  }

  return (
    <AppContext.Provider value={{ user, setUser, accessToken, refreshToken, setTokens, contexts, setContexts, activeContext, setActiveContext, logout, specialties, medicalSystems, qualifications }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
