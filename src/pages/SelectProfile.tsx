import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { getContexts, switchContext } from '../services/api'
import type { UserContext } from '../services/types'
import { useAppContext } from '../context/AppContext'
import AuthLayout from '../components/AuthLayout'
import './SelectProfile.css'

interface SelectProfileProps {
  onSelect: (ctx: UserContext) => void
}

const SelectProfile: FC<SelectProfileProps> = ({ onSelect }) => {
  const { setTokens, setContexts: storeContexts, setActiveContext } = useAppContext()
  const [contexts, setContexts] = useState<UserContext[]>([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)

  const handleSelect = async (ctx: UserContext) => {
    setSwitching(ctx.medicalCenter.id)
    try {
      const res = await switchContext(ctx.role, ctx.medicalCenter.id)
      if (res.success) {
        setTokens(res.data.accessToken, res.data.refreshToken)
        setActiveContext(ctx)
        onSelect(ctx)
      }
    } catch {
      setActiveContext(ctx)
      onSelect(ctx)
    } finally {
      setSwitching(null)
    }
  }

  useEffect(() => {
    getContexts()
      .then(res => { if (res.success) { setContexts(res.data); storeContexts(res.data) } })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthLayout>
      <h2 className="form-title">Select Profile</h2>
      <p className="form-subtitle">Choose a clinic profile to continue</p>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#636A79', fontFamily: 'Manrope', marginTop: 24 }}>Loading...</p>
      ) : contexts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#A0A5B1', fontFamily: 'Manrope', marginTop: 24 }}>No profiles found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {contexts.map((ctx, i) => (
            <div key={i} className="sp-card" onClick={() => handleSelect(ctx)} style={{ opacity: switching === ctx.medicalCenter.id ? 0.6 : 1 }}>
              <img
                src={ctx.medicalCenter.profilePicture || `https://i.pravatar.cc/48?u=${ctx.medicalCenter.id}`}
                alt={ctx.medicalCenter.name}
                className="sp-avatar"
              />
              <div className="sp-info">
                <span className="sp-name">{ctx.medicalCenter.name}</span>
                <span className="sp-role">{ctx.role}</span>
              </div>
              <span className="sp-arrow">›</span>
            </div>
          ))}
        </div>
      )}
    </AuthLayout>
  )
}

export default SelectProfile
