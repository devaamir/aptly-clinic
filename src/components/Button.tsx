import type { FC, ButtonHTMLAttributes } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: 'primary' | 'outline'
}

const Button: FC<ButtonProps> = ({ label, variant = 'primary', ...props }) => {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {label}
    </button>
  )
}

export default Button
