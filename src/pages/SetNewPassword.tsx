import type { FC } from 'react'
import { useState } from 'react'
import InputBox from '../components/InputBox'
import Button from '../components/Button'
import AuthLayout from '../components/AuthLayout'
import lockIcon from '../assets/icons/lock.svg'
import eyeIcon from '../assets/icons/security-eye.svg'
import './Login.css'

interface SetNewPasswordProps {
  onSuccess: () => void
}

const SetNewPassword: FC<SetNewPasswordProps> = ({ onSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <AuthLayout>
      <h2 className="form-title">Create New Password</h2>
      <p className="form-subtitle">Please create a secure password to use for logging into your account</p>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <InputBox
          type="password"
          placeholder="New Password"
          leftIcon={<img src={lockIcon} alt="" />}
        />
        <span className="input-hint">Must be least 8 characters</span>
      </div>

      <div className="form-group" style={{ marginBottom: '30px' }}>
        <InputBox
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirm Password"
          leftIcon={<img src={lockIcon} alt="" />}
          rightIcon={
            <img
              src={eyeIcon}
              alt="toggle"
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => setShowConfirm(p => !p)}
            />
          }
        />
        <span className="input-hint">Both passwords must match</span>
      </div>

      <Button label="Continue" style={{ marginBottom: '24px' }} onClick={onSuccess} />

      <p className="trouble-text">Having trouble? <a href="#">Contact Us</a></p>
    </AuthLayout>
  )
}

export default SetNewPassword
