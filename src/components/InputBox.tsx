import type { FC, InputHTMLAttributes, ReactNode } from 'react'
import './InputBox.css'

interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const InputBox: FC<InputBoxProps> = ({ placeholder, leftIcon, rightIcon, ...props }) => {
  return (
    <div className="input-wrapper">
      {leftIcon && <span className="input-icon left">{leftIcon}</span>}
      <input
        className={`input-box ${leftIcon ? 'has-left' : ''} ${rightIcon ? 'has-right' : ''}`}
        placeholder={placeholder}
        {...props}
      />
      {rightIcon && <span className="input-icon right">{rightIcon}</span>}
    </div>
  )
}

export default InputBox
