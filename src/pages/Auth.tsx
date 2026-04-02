import type { FC } from 'react'
import { useState } from 'react'
import InputBox from '../components/InputBox'
import Button from '../components/Button'
import AuthLayout from '../components/AuthLayout'
import smsIcon from '../assets/icons/sms.svg'
import lockIcon from '../assets/icons/lock.svg'
import eyeIcon from '../assets/icons/security-eye.svg'
import recaptchaImg from '../assets/images/re-captcha.png'
import tickBlue from '../assets/icons/tick-blue.svg'
import tickIcon from '../assets/icons/tick-icon.svg'
import warningRed from '../assets/icons/warning-red.svg'
import './Auth.css'

type Screen = 'login' | 'set-password' | 'success' | 'link-expired'

interface AuthProps {
  onLogin: () => void
}

const Auth: FC<AuthProps> = ({ onLogin }) => {
  const [screen, setScreen] = useState<Screen>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [notRobot, setNotRobot] = useState(false)

  return (
    <AuthLayout>
      {screen === 'login' && (
        <>
          <h2 className="form-title">Login to continue</h2>
          <p className="form-subtitle">Enter your email address and password to login</p>

          <div className="form-group" style={{ marginBottom: '17.5px' }}>
            <InputBox type="email" placeholder="Email Address" leftIcon={<img src={smsIcon} alt="" />} />
          </div>

          <div className="form-group">
            <InputBox
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              leftIcon={<img src={lockIcon} alt="" />}
              rightIcon={
                <img src={eyeIcon} alt="toggle" style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onClick={() => setShowPassword(p => !p)} />
              }
            />
          </div>

          <div className="form-row">
            <a href="#" className="forgot-link" onClick={e => { e.preventDefault(); setScreen('set-password') }}>Forgot Password?</a>
          </div>

          <div className="captcha-btn" onClick={() => setNotRobot(p => !p)} style={{ cursor: 'pointer' }}>
            <span className={`captcha-check-custom ${notRobot ? 'checked' : ''}`}>
              {notRobot && <img src={tickIcon} alt="" style={{ width: 12, height: 12 }} />}
            </span>
            <span className="captcha-label">I'm not a robot</span>
            <img src={recaptchaImg} alt="reCAPTCHA" className="captcha-logo" />
          </div>

          <Button label="Login" style={{ marginBottom: '24px' }} onClick={onLogin} />
          <p className="trouble-text">Having trouble logging in? <a href="#">Contact Us</a></p>
        </>
      )}

      {screen === 'set-password' && (
        <>
          <h2 className="form-title">Create New Password</h2>
          <p className="form-subtitle">Please create a secure password to use for logging into your account</p>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <InputBox type="password" placeholder="New Password" leftIcon={<img src={lockIcon} alt="" />} />
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
          <Button label="Continue" onClick={onLogin} />
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
