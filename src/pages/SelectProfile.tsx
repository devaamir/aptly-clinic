import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { getContexts, switchContext } from '../services/api'
import type { UserContext } from '../services/types'
import { useAppContext } from '../context/AppContext'
import AuthLayout from '../components/AuthLayout'
import arrowLeft from '../assets/icons/arrow-left.svg'
import './SelectProfile.css'

interface SelectProfileProps {
  onSelect: (ctx: UserContext) => void
  onBack: () => void
}

const SelectProfile: FC<SelectProfileProps> = ({ onSelect, onBack }) => {
  const { setTokens, setContexts: storeContexts, setActiveContext, setActiveDoctor } = useAppContext()
  const [contexts, setContexts] = useState<UserContext[]>([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [failedId, setFailedId] = useState<string | null>(null)

  const handleSelect = async (ctx: UserContext) => {
    setSwitching(ctx.medicalCenter.id)
    setFailedId(null)
    try {
      const res = await switchContext(ctx.role, ctx.medicalCenter.id)
      if (res.success) {
        setTokens(res.data.accessToken, res.data.refreshToken)
        setActiveContext({ role: ctx.role, medicalCenter: res.data.medicalCenter })
        setActiveDoctor(res.data.doctor)
        onSelect(ctx)
      } else {
        setFailedId(ctx.medicalCenter.id)
      }
    } catch {
      setFailedId(ctx.medicalCenter.id)
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
      <button className="sp-back-btn" onClick={onBack}>
        <img src={arrowLeft} alt="" style={{ width: 16, height: 16 }} />
        Back to Login
      </button>
      <h2 className="form-title">Select Profile</h2>
      <p className="form-subtitle">Choose a clinic profile to continue</p>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#636A79', fontFamily: 'Manrope', marginTop: 24 }}>Loading...</p>
      ) : contexts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#A0A5B1', fontFamily: 'Manrope', marginTop: 24 }}>No profiles found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {contexts.map((ctx, i) => (
            <div key={i}>
              <div
                className="sp-card"
                onClick={() => handleSelect(ctx)}
                style={{
                  opacity: switching === ctx.medicalCenter.id ? 0.6 : 1,
                  border: failedId === ctx.medicalCenter.id ? '1.5px solid #FF5A4F' : undefined,
                }}
              >
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
              {failedId === ctx.medicalCenter.id && (
                <div style={{ marginTop: 6, padding: '8px 12px', background: '#FFF2F1', borderRadius: 8, border: '1px solid #FFCCC9' }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#CC3A31', fontFamily: 'Manrope', fontWeight: 600 }}>
                    Couldn't switch to this profile.
                  </p>
                  {contexts.filter(c => c.medicalCenter.id !== ctx.medicalCenter.id).length > 0 && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#636A79', fontFamily: 'Manrope' }}>
                      Please select a clinic profile below to continue.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AuthLayout>
  )
}

export default SelectProfile
