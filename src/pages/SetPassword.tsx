import type { FC } from 'react'
import { useState } from 'react'
import { setPassword as setPasswordApi } from '../services/api'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import eyeIcon from '../assets/icons/security-eye.svg'
import warningRed from '../assets/icons/warning-red.svg'
import tickBlue from '../assets/icons/tick-blue.svg'
import './SetPassword.css'

const SetPassword: FC = () => {
  const token = new URLSearchParams(window.location.search).get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const rules = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'One number', pass: /[0-9]/.test(password) },
    { label: 'One special character (@$!%*?&#)', pass: /[@$!%*?&#]/.test(password) },
  ]
  const isValid = rules.every(r => r.pass) && password === confirm

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      await setPasswordApi(token, password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  // No token in URL
  if (!token) {
    return (
      <AuthLayout>
        <div className="set-password-content" style={{ textAlign: 'center' }}>
          <div className="success-icon-wrapper">
            <img src={warningRed} alt="" className="success-icon" />
          </div>
          <h1 className="set-password-title">Invalid Link</h1>
          <p className="set-password-subtitle">This link is invalid or missing a token. Please use the link sent to your email.</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="set-password-content">
        {success && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}>
            <div style={{
              background: '#fff', borderRadius: 16, padding: '32px 28px',
              width: 340, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              fontFamily: 'Manrope',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#E6F9F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <img src={tickBlue} alt="" style={{ width: 28, height: 28 }} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 8px' }}>Password Set Successfully</h2>
              <p style={{ fontSize: 13, color: '#636A79', margin: '0 0 24px' }}>Your password has been created. You can now log in to your account.</p>
              <button
                className="set-password-btn"
                style={{ margin: 0 }}
                onClick={() => { window.location.href = '/' }}
              >
                OK, Go to Login
              </button>
            </div>
          </div>
        )}
        <>
            <h1 className="set-password-title">Set Password</h1>
            <p className="set-password-subtitle">Create a password for your account</p>
            {error && <div className="set-password-error">{error}</div>}
            <div className="set-password-form">
              <div style={{ position: 'relative' }}>
                <FormField
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword((e.target as HTMLInputElement).value)}
                />
                <img
                  src={eyeIcon}
                  alt="toggle"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 12, top: 34, width: 18, height: 18, cursor: 'pointer', opacity: 0.6 }}
                />
              </div>
              {password && (
                <ul className="set-password-rules">
                  {rules.map(r => (
                    <li key={r.label} className={r.pass ? 'rule-pass' : 'rule-fail'}>
                      {r.pass ? '✓' : '✗'} {r.label}
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ position: 'relative' }}>
                <FormField
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={e => setConfirm((e.target as HTMLInputElement).value)}
                />
                <img
                  src={eyeIcon}
                  alt="toggle"
                  onClick={() => setShowConfirm(p => !p)}
                  style={{ position: 'absolute', right: 12, top: 34, width: 18, height: 18, cursor: 'pointer', opacity: 0.6 }}
                />
              </div>
              {confirm && password !== confirm && (
                <p className="set-password-mismatch">Passwords do not match</p>
              )}
              <button
                className="set-password-btn"
                onClick={handleSubmit}
                disabled={loading || !isValid}
              >
                {loading ? 'Setting...' : 'Set Password'}
              </button>
            </div>
          </>
      </div>
    </AuthLayout>
  )
}

export default SetPassword
