import type { FC } from 'react'
import { useState } from 'react'
import InputBox from '../components/InputBox'
import Button from '../components/Button'
import AuthLayout from '../components/AuthLayout'
import smsIcon from '../assets/icons/sms.svg'
import lockIcon from '../assets/icons/lock.svg'
import eyeIcon from '../assets/icons/security-eye.svg'
import tickIcon from '../assets/icons/tick-icon.svg'
import recaptchaImg from '../assets/images/re-captcha.png'
import './Login.css'

interface LoginProps {
  onForgotPassword: () => void
}

const Login: FC<LoginProps> = ({ onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [notRobot, setNotRobot] = useState(false)

  return (
    <AuthLayout>
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
            <img
              src={eyeIcon}
              alt="toggle password"
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => setShowPassword(p => !p)}
            />
          }
        />
      </div>

      <div className="form-row">
        <a href="#" className="forgot-link" onClick={e => { e.preventDefault(); onForgotPassword() }}>Forgot Password?</a>
      </div>

      <div className="captcha-btn" onClick={() => setNotRobot(p => !p)} style={{ cursor: 'pointer' }}>
        <span className={`captcha-check-custom ${notRobot ? 'checked' : ''}`}>
          {notRobot && <img src={tickIcon} alt="" style={{ width: 12, height: 12 }} />}
        </span>
        <span className="captcha-label">I'm not a robot</span>
        <img src={recaptchaImg} alt="reCAPTCHA" className="captcha-logo" />
      </div>

      <Button label="Login" style={{ marginBottom: '24px' }} />

      <p className="trouble-text">Having trouble logging in? <a href="#">Contact Us</a></p>
    </AuthLayout>
  )
}

export default Login
