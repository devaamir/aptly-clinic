import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'
import './Toast.css'

interface ToastProps {
  message: string
  onClose: () => void
  icon?: ReactNode
  duration?: number
}

const Toast: FC<ToastProps> = ({ message, onClose, icon, duration = 3000 }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="toast">
      {icon && <span className="toast-icon">{icon}</span>}
      {message}
    </div>
  )
}

export default Toast
