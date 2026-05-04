import type { FC, ReactNode } from 'react'
import logo from '../assets/images/logo.png'
import spotlightImg from '../assets/images/login-spotlight.jpg'
import { colors } from '../styles/colors'
import '../pages/Login.css'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="login-screen">
      {/* Left Side */}
      <div className="login-left" style={{ backgroundColor: colors.primary, backgroundImage: `url(${spotlightImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="login-left-content">
          <div>
            {/* <img src={logo} alt="Aptly" className="brand-logo" /> */}
            <p className="tagline" style={{ color: '#ffffff', marginTop: 80 }}>
              Aptly Care is your all-in-one platform for booking appointments and managing live queues. Find nearby clinics, book instantly, and track your turn in real time.
            </p>
          </div>
          <div className="left-actions">
            <button>Privacy & Policy</button>
            <button>Terms & Conditions</button>
            <button>Contact Us</button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="right-wrapper" style={{ background: '#ffffff' }}>
          <div className="login-form">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
