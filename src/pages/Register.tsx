import type { FC } from 'react'
import { useState } from 'react'
import InputBox from '../components/InputBox'
import Button from '../components/Button'
import AuthLayout from '../components/AuthLayout'
import { register } from '../services/api'
import smsIcon from '../assets/icons/sms.svg'
import tickBlue from '../assets/icons/tick-blue.svg'
import './Auth.css'

type Screen = 'form' | 'success'

const Register: FC = () => {
  const [screen, setScreen] = useState<Screen>('form')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)

  const handleRegister = async () => {
    setEmailError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await register(email, 'medical-center-manager')
      if (res.success) {
        setDevToken(res.data.token ?? null)
        setScreen('success')
      } else {
        setError(res.message || 'Registration failed. Please try again.')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {screen === 'form' && (
        <>
          <h2 className="form-title">Create an account</h2>
          <p className="form-subtitle">Enter your email address to get started</p>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <InputBox
              type="email"
              placeholder="Email Address"
              leftIcon={<img src={smsIcon} alt="" />}
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              error={!!emailError}
            />
            {emailError && <p style={{ color: '#F04438', fontSize: 12, marginTop: 4, fontFamily: 'Manrope' }}>{emailError}</p>}
          </div>

          {error && <p style={{ color: '#F04438', fontSize: 13, marginBottom: 8, fontFamily: 'Manrope' }}>{error}</p>}
          <Button
            label={loading ? 'Registering...' : 'Register'}
            style={{ marginBottom: '24px' }}
            onClick={handleRegister}
          />
          <p className="trouble-text">
            Already have an account? <a href="/login" onClick={e => { e.preventDefault(); window.location.pathname = '/' }}>Login</a>
          </p>
        </>
      )}

      {screen === 'success' && (
        <div className="success-view">
          <div className="success-icon-wrapper">
            <img src={tickBlue} alt="Email sent" className="success-icon" />
          </div>
          <h2 className="form-title">Check your email</h2>
          <p className="form-subtitle">
            A verification link has been sent to <strong>{email}</strong>.
            Please check your inbox and follow the link to complete registration.
          </p>
          {devToken && (
            <div style={{ width: '100%', marginBottom: 20, background: '#F5F7FA', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', boxSizing: 'border-box' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#A0A5B1', fontFamily: 'Manrope', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>Dev Token</p>
              <p style={{ fontSize: 11, color: '#4A5568', fontFamily: 'monospace', wordBreak: 'break-all', margin: 0 }}>{devToken}</p>
            </div>
          )}
          <Button label="Back to Login" onClick={() => { window.location.pathname = '/' }} />
        </div>
      )}
    </AuthLayout>
  )
}

export default Register
