import type { FC, ButtonHTMLAttributes } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: 'primary' | 'outline'
}

const Button: FC<ButtonProps> = ({ label, variant = 'primary', type = 'button', ...props }) => {
  return (
    <button type={type} className={`btn btn-${variant}`} {...props}>
      {label}
    </button>
  )
}

export default Button
