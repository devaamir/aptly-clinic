import type { FC, ReactNode } from 'react'
import logo from '../assets/images/logo.png'
import { colors } from '../styles/colors'
import '../pages/Login.css'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="login-screen">
      {/* Left Side */}
      <div className="login-left" style={{ backgroundColor: colors.primary }}>
        <div className="login-left-content">
          <img src={logo} alt="Aptly" className="brand-logo" />
          <p className="tagline" style={{ color: colors.textSecondary }}>
            is your complete booking and queue management platform designed to
            simplify appointments and reduce waiting time. It helps users book
            services seamlessly while enabling providers to manage real-time
            queues efficiently. With APTLY, scheduling becomes faster, smarter,
            and stress-free.
          </p>
          <div className="left-actions">
            <button>About</button>
            <button>FAQ</button>
            <button>Support</button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="right-wrapper" style={{ background: colors.rightBg }}>
          <div className="login-form">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
