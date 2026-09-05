import type { FC, ReactNode } from 'react'
import './Modal.css'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  autoSize?: boolean
}

const Modal: FC<ModalProps> = ({ onClose, children, autoSize }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className={`modal-card${autoSize ? ' modal-card--auto' : ''}`} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
)

export default Modal
