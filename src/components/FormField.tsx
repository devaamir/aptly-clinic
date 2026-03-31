import type { FC, InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import { useRef } from 'react'
import arrowDown from '../assets/icons/arrow-down.svg'
import './FormField.css'

interface BaseProps {
  label: string
  showRequired?: boolean
}

interface InputProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input'
  prefix?: string
  rightIcon?: string
  options?: never
}

interface SelectProps extends BaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select'
  options: { label: string; value: string }[]
  prefix?: never
}

type FormFieldProps = InputProps | SelectProps

const FormField: FC<FormFieldProps> = ({ label, showRequired = true, as, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputProps = props as InputProps

  return (
    <div className="form-field">
      <label className="form-field-label">
        {label}{showRequired && <span className="form-field-required"> *</span>}
      </label>
      {as === 'select' ? (
        <div className="form-field-select-wrap">
          <select className="form-field-input form-field-select" {...(props as SelectHTMLAttributes<HTMLSelectElement>)}>
            <option value="">Select</option>
            {(props as SelectProps).options?.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <img src={arrowDown} alt="" className="form-field-arrow" />
        </div>
      ) : (
        <div className={`form-field-input-wrap ${inputProps.prefix ? 'has-prefix' : ''}`}>
          {inputProps.prefix && <span className="form-field-prefix">{inputProps.prefix}</span>}
          <input
            ref={inputRef}
            className="form-field-input"
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
          {inputProps.rightIcon && (
            <img
              src={inputProps.rightIcon}
              alt=""
              className="form-field-right-icon"
              onClick={() => {
                inputRef.current?.focus()
                inputRef.current?.showPicker?.()
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default FormField
