import type { FC } from 'react'
import { useState } from 'react'
import InputBox from '../components/InputBox'
import Button from '../components/Button'
import AuthLayout from '../components/AuthLayout'
import { useAppContext } from '../context/AppContext'
import { login } from '../services/api'
import smsIcon from '../assets/icons/sms.svg'
import lockIcon from '../assets/icons/lock.svg'
import eyeIcon from '../assets/icons/security-eye.svg'
import tickBlue from '../assets/icons/tick-blue.svg'
import warningRed from '../assets/icons/warning-red.svg'
import './Auth.css'

type Screen = 'login' | 'set-password' | 'success' | 'link-expired'

interface AuthProps {
  onLogin: (isNewAccount: boolean) => void
}

const Auth: FC<AuthProps> = ({ onLogin }) => {
  const { setTokens, setUser } = useAppContext()
  const [screen, setScreen] = useState<Screen>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)


  const handleLogin = async () => {
    setEmailError(''); setPasswordError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email address.'); return }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); return }
    setError(''); setLoading(true)
    try {
      const res = await login(email, password) as any
      if (!res.success) {
        // handle field-level errors from backend
        if (res.errors?.length) {
          res.errors.forEach((e: { field: string; message: string }) => {
            if (e.field === 'emailAddress') setEmailError(e.message)
            else if (e.field === 'password') setPasswordError(e.message)
            else setError(e.message)
          })
        } else {
          setError(res.message || 'Invalid email or password.')
        }
        setLoading(false)
        return
      }
      setTokens(res.data.accessToken, res.data.refreshToken)
      setUser({ ...res.data.user })
      onLogin(res.data.context?.medicalCenterId === null)
      // intentionally keep loading=true — screen will unmount this component anyway
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {screen === 'login' && (
        <>
          <h2 className="form-title">Login to continue</h2>
          <p className="form-subtitle">Enter your email address and password to login</p>

          <form onSubmit={e => { e.preventDefault(); handleLogin() }}>
            <div className="form-group" style={{ marginBottom: '17.5px' }}>
              <InputBox type="email" placeholder="Email Address" leftIcon={<img src={smsIcon} alt="" />} value={email} onChange={e => { setEmail(e.target.value); setEmailError('') }} error={!!emailError} />
              {emailError && <p style={{ color: '#F04438', fontSize: 12, marginTop: 4, fontFamily: 'Manrope' }}>{emailError}</p>}
            </div>

            <div className="form-group">
              <InputBox
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                leftIcon={<img src={lockIcon} alt="" />}
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                error={!!passwordError}
                rightIcon={
                  <img src={eyeIcon} alt="toggle" style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    onClick={() => setShowPassword(p => !p)} />
                }
              />
              {passwordError && <p style={{ color: '#F04438', fontSize: 12, marginTop: 4, fontFamily: 'Manrope' }}>{passwordError}</p>}
            </div>

            <div className="form-row">
              <a href="#" className="forgot-link" onClick={e => { e.preventDefault(); setScreen('set-password') }}>Forgot Password?</a>
            </div>

            {error && <p style={{ color: '#F04438', fontSize: 13, marginBottom: 8, fontFamily: 'Manrope' }}>{error}</p>}
            <Button type="submit" label={loading ? 'Logging in...' : 'Login'} style={{ marginBottom: '24px' }} />
          </form>
          <p className="trouble-text">Having trouble logging in? <a href="https://wa.me/919778798511" target="_blank" rel="noreferrer">Contact Us</a></p>
        </>
      )}

      {screen === 'set-password' && (
        <>
          <h2 className="form-title">Create New Password</h2>
          <p className="form-subtitle">Please create a secure password to use for logging into your account</p>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <InputBox
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              leftIcon={<img src={lockIcon} alt="" />}
              rightIcon={
                <img src={eyeIcon} alt="toggle" style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onClick={() => setShowPassword(p => !p)} />
              }
            />
            <span className="input-hint">Must be least 8 characters</span>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <InputBox
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              leftIcon={<img src={lockIcon} alt="" />}
              rightIcon={
                <img src={eyeIcon} alt="toggle" style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onClick={() => setShowConfirm(p => !p)} />
              }
            />
            <span className="input-hint">Both passwords must match</span>
          </div>

          <Button label="Continue" style={{ marginBottom: '24px' }} onClick={() => setScreen('success')} />
          <p className="trouble-text">Having trouble? <a href="#">Contact Us</a></p>
        </>
      )}

      {screen === 'success' && (
        <div className="success-view">
          <div className="success-icon-wrapper">
            <img src={tickBlue} alt="Success" className="success-icon" />
          </div>
          <h2 className="form-title">Successfully Reset</h2>
          <p className="form-subtitle">Your password has been successfully set. Click below to log in.</p>
          <Button label="Continue" onClick={() => onLogin(false)} />
        </div>
      )}
      {screen === 'link-expired' && (
        <div className="success-view">
          <div className="success-icon-wrapper">
            <img src={warningRed} alt="Link Expired" className="success-icon" />
          </div>
          <h2 className="form-title">Link Expired</h2>
          <p className="form-subtitle">Activation link has expired. Please contact us for further assistance.</p>
          <Button label="Contact Now" />
        </div>
      )}
    </AuthLayout>
  )
}

export default Auth
