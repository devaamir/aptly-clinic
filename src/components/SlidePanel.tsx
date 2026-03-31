import type { FC, ReactNode } from 'react'
import arrowLeft from '../assets/icons/arrow-left.svg'
import './SlidePanel.css'

interface SlidePanelProps {
  title: string
  onClose: () => void
  children: ReactNode
}

const SlidePanel: FC<SlidePanelProps> = ({ title, onClose, children }) => (
  <>
    <div className="slide-overlay" onClick={onClose} />
    <div className="slide-panel">
      <div className="slide-header">
        <button className="slide-back" onClick={onClose}>
          <img src={arrowLeft} alt="back" style={{ width: 18, height: 18 }} />
        </button>
        <h2 className="slide-title">{title}</h2>
      </div>
      <div className="slide-body">{children}</div>
    </div>
  </>
)

export default SlidePanel
