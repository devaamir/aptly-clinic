import type { FC } from 'react'
import './Badge.css'

interface BadgeProps {
  text: string
  bgColor: string
  textColor: string
  dotColor: string
}

const Badge: FC<BadgeProps> = ({ text, bgColor, textColor, dotColor }) => {
  return (
    <span className="badge" style={{ backgroundColor: bgColor, color: textColor }}>
      <span className="badge-dot" style={{ backgroundColor: dotColor }} />
      {text}
    </span>
  )
}

export default Badge
