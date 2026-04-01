import type { FC } from 'react'
import { useState } from 'react'
import Modal from './Modal'
import scheduledPauseIcon from '../assets/icons/scheduled-pause.svg'
import './InstantPauseModal.css'
import './ScheduledPauseModal.css'

interface ScheduledPauseModalProps {
  onClose: () => void
  onSubmit: (startAt: string, duration: string) => void
}

const durations = ['5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '60 min']

const getNow = () => {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

const ScheduledPauseModal: FC<ScheduledPauseModalProps> = ({ onClose, onSubmit }) => {
  const [startAt, setStartAt] = useState(getNow())
  const [duration, setDuration] = useState('5 min')

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '24px', width: 470 }}>
      <div className="ip-header">
        <div className="ip-icon-wrap">
          <img src={scheduledPauseIcon} alt="" className="ip-icon" />
        </div>
        <button className="ip-close" onClick={onClose}>✕</button>
      </div>

      <h2 className="ip-title">Scheduled Pause</h2>
      <p className="ip-desc">
        Plan a break in advance. The queue will pause at the selected time and resume automatically after the chosen duration. Waiting patients will be notified.
      </p>

      <div className="sp-row">
        <div className="sp-field">
          <label className="ip-label">Pause Start At*</label>
          <input
            className="ip-select"
            type="time"
            value={startAt}
            min={getNow()}
            onChange={e => { if (e.target.value >= getNow()) setStartAt(e.target.value) }}
            onKeyDown={e => { if (e.key === 'ArrowDown' && startAt <= getNow()) e.preventDefault() }}
            onBlur={() => { if (startAt < getNow()) setStartAt(getNow()) }}
          />
        </div>
        <div className="sp-field">
          <label className="ip-label">Pause Duration*</label>
          <select className="ip-select" value={duration} onChange={e => setDuration(e.target.value)}>
            {durations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="ip-actions">
        <button className="ip-btn ip-cancel" onClick={onClose}>Cancel</button>
        <button className="ip-btn ip-submit" onClick={() => startAt && onSubmit(startAt, duration)}>Submit</button>
      </div>
      </div>
    </Modal>
  )
}

export default ScheduledPauseModal
