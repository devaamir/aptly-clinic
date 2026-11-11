import type { FC } from 'react'
import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import './DeleteAccount.css'

const DeleteAccount: FC = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [loading] = useState(false)
  const [error] = useState('')

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) return
    setStep('otp')
  }

  const handleVerifyAndDelete = () => {
    if (!otp || otp.length < 6) return
    setStep('success')
  }

  return (
    <AuthLayout>
      <div className="delete-account-content">
        {step === 'phone' && (
          <>
            <h1 className="delete-account-title">Delete Account</h1>
            <p className="delete-account-subtitle">
              Enter your phone number to receive a verification code
            </p>
            {error && <div className="delete-account-error">{error}</div>}
            <div className="delete-account-form">
              <FormField
                label="Phone Number"
                type="tel"
                prefix="+91"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber((e.target as HTMLInputElement).value)}
              />
              <button
                className="delete-account-btn"
                onClick={handleSendOtp}
                disabled={loading || phoneNumber.length < 10}
              >
                Send OTP
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="delete-account-title">Verify OTP</h1>
            <p className="delete-account-subtitle">
              Enter the verification code sent to +91 {phoneNumber}
            </p>
            {error && <div className="delete-account-error">{error}</div>}
            <div className="delete-account-form">
              <FormField
                label="OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp((e.target as HTMLInputElement).value)}
              />
              <button
                className="delete-account-btn delete-account-btn-danger"
                onClick={handleVerifyAndDelete}
                disabled={loading || otp.length < 6}
              >
                Delete Account
              </button>
              <button
                className="delete-account-btn-secondary"
                onClick={() => { setStep('phone'); setOtp('') }}
                disabled={loading}
              >
                Back
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="delete-account-success">
            <div className="delete-account-success-icon">✓</div>
            <h1 className="delete-account-title">Account Deleted</h1>
            <p className="delete-account-subtitle">
              Your account has been successfully deleted
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default DeleteAccount
