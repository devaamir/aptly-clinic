import type { FC } from 'react'
import Modal from './Modal'
import phoneIcon from '../assets/icons/phone-icon.svg'
import './PatientModal.css'

interface Patient {
  token: string
  name: string
  phone: string
  age: number
  gender: string
  avatar: string
  status: string
}

interface PatientModalProps {
  patient: Patient
  onClose: () => void
  onCall: () => void
  onCancel: () => void
}

const PatientModal: FC<PatientModalProps> = ({ patient, onClose, onCall, onCancel }) => {
  return (
    <Modal onClose={onClose}>
      <div className="modal-header">
        <span className="modal-token">Token #{patient.token}</span>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <img src={patient.avatar} alt={patient.name} className="modal-avatar" />
        <h3 className="modal-name">{patient.name}</h3>
        <div className="modal-meta">
          <span>{patient.phone}</span>
          <span className="meta-dot">•</span>
          <span>{patient.age} yrs</span>
          <span className="meta-dot">•</span>
          <span>{patient.gender}</span>
        </div>
        <div className="modal-actions">
          <button className="modal-btn call-btn" onClick={onCall}>
            <img src={phoneIcon} alt="" className="modal-btn-icon" /> Call
          </button>
          {patient.status === 'pending' && (
            <button className="modal-btn cancel-btn" onClick={onCancel}>Cancel Token</button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default PatientModal
