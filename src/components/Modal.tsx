import type { FC, ReactNode } from 'react'
import './Modal.css'

interface ModalProps {
  onClose: () => void
  children: ReactNode
}

const Modal: FC<ModalProps> = ({ onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-card" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
)

export default Modal
