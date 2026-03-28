import type { FC } from 'react'
import Button from '../components/Button'
import AuthLayout from '../components/AuthLayout'
import tickBlue from '../assets/icons/tick-blue.svg'
import './Login.css'

interface SuccessViewProps {
  onContinue: () => void
}

const SuccessView: FC<SuccessViewProps> = ({ onContinue }) => {
  return (
    <AuthLayout>
      <div className="success-view">
        <div className="success-icon-wrapper">
          <img src={tickBlue} alt="Success" className="success-icon" />
        </div>
        <h2 className="form-title">Successfully Reset</h2>
        <p className="form-subtitle">Your password has been successfully set. Click below to log in.</p>
        <Button label="Continue" onClick={onContinue} />
      </div>
    </AuthLayout>
  )
}

export default SuccessView
