import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth'
import { auth } from '../services/firebase'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import './DeleteAccount.css'

const DeleteAccount: FC = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      })
      window.recaptchaVerifier.render()
    }
  }, [])

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return
    setLoading(true)
    setError('')
    
    try {
      const appVerifier = window.recaptchaVerifier
      
      // Force captcha execution
      await appVerifier.verify()
      
      const fullPhoneNumber = `+91${phoneNumber}`
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier)
      setConfirmationResult(result)
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndDelete = async () => {
    if (!otp || otp.length < 6 || !confirmationResult) return
    setLoading(true)
    setError('')
    
    try {
      await confirmationResult.confirm(otp)
      // TODO: Call your backend API to delete the account
      // await api.post('/auth/delete-account', { phoneNumber })
      setStep('success')
    } catch (err: any) {
      setError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="delete-account-content">
        <div id="recaptcha-container"></div>
        
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
                {loading ? 'Sending...' : 'Send OTP'}
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
                {loading ? 'Verifying...' : 'Delete Account'}
              </button>
              <button
                className="delete-account-btn-secondary"
                onClick={() => { setStep('phone'); setOtp(''); setError('') }}
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
