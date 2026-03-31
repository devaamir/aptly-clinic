import type { FC } from 'react'
import { useState } from 'react'
import Modal from './Modal'
import instantPauseIcon from '../assets/icons/instant-pause.svg'
import './InstantPauseModal.css'

interface InstantPauseModalProps {
  onClose: () => void
  onSubmit: (duration: string) => void
}

const durations = ['5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '60 min']

const InstantPauseModal: FC<InstantPauseModalProps> = ({ onClose, onSubmit }) => {
  const [selected, setSelected] = useState('5 min')

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '24px' }}>
      <div className="ip-header">
        <div className="ip-icon-wrap">
          <img src={instantPauseIcon} alt="" className="ip-icon" />
        </div>
        <button className="ip-close" onClick={onClose}>✕</button>
      </div>

      <h2 className="ip-title">Instant Pause</h2>
      <p className="ip-desc">
        Taking a short break? The queue will be paused for the selected duration and waiting patients will be notified. You can resume anytime.
      </p>

      <label className="ip-label">Pause Duration*</label>
      <select className="ip-select" value={selected} onChange={e => setSelected(e.target.value)}>
        {durations.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <div className="ip-actions">
        <button className="ip-btn ip-cancel" onClick={onClose}>Cancel</button>
        <button className="ip-btn ip-submit" onClick={() => selected && onSubmit(selected)}>Submit</button>
      </div>
      </div>
    </Modal>
  )
}

export default InstantPauseModal
