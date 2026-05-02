import type { FC } from 'react'
import { useState } from 'react'
import { setPassword as setPasswordApi } from '../services/api'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import './SetPassword.css'

const SetPassword: FC = () => {
  const token = new URLSearchParams(window.location.search).get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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
      setTimeout(() => { window.location.href = '/' }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="set-password-content">
          <h1 className="set-password-title">Invalid Link</h1>
          <p className="set-password-subtitle">This link is missing a valid invite token.</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="set-password-content">
        {success ? (
          <div className="set-password-success">
            <div className="set-password-success-icon">✓</div>
            <h1 className="set-password-title">Password Set</h1>
            <p className="set-password-subtitle">Your password has been set. You can now log in.</p>
          </div>
        ) : (
          <>
            <h1 className="set-password-title">Set Password</h1>
            <p className="set-password-subtitle">Create a password for your account</p>
            {error && <div className="set-password-error">{error}</div>}
            <div className="set-password-form">
              <FormField
                label="New Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword((e.target as HTMLInputElement).value)}
              />
              {password && (
                <ul className="set-password-rules">
                  {rules.map(r => (
                    <li key={r.label} className={r.pass ? 'rule-pass' : 'rule-fail'}>
                      {r.pass ? '✓' : '✗'} {r.label}
                    </li>
                  ))}
                </ul>
              )}
              <FormField
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm((e.target as HTMLInputElement).value)}
              />
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
        )}
      </div>
    </AuthLayout>
  )
}

export default SetPassword
