import type { FC } from 'react'
import { useState } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { appointments, statusProps as aptStatusProps, bookingProps } from '../data/appointments'
import patientsGreenIcon from '../assets/icons/patients-green-icon.svg'
import patientsRedIcon from '../assets/icons/patients-red-icon.svg'
import clockBlueIcon from '../assets/icons/clock-blue-icon.svg'
import qualificationIcon from '../assets/icons/qualification-icon.svg'
import experienceIcon from '../assets/icons/experience-icon.svg'
import phoneIcon from '../assets/icons/phone-icon-grey.svg'
import emailIcon from '../assets/icons/email-icon.svg'
import buildingIcon from '../assets/icons/building-icon.svg'
import dollarIcon from '../assets/icons/dollar-icon.svg'
import './DoctorProfile.css'

interface Doctor {
  id: string
  name: string
  avatar: string
  specialty: string
  phone: string
  email: string
  experience: string
  status: 'Active' | 'Inactive'
}

const statusProps = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

interface DoctorProfileProps {
  doctor: Doctor
  onBack: () => void
}

const DoctorProfile: FC<DoctorProfileProps> = ({ doctor, onBack }) => {
  const doctorApts = appointments.filter(a => a.doctor === doctor.name)
  const [activeTab, setActiveTab] = useState<'Overview' | 'Schedule' | 'Leaves' | 'Documents'>('Overview')

  const weekSchedule = [
    { day: 'Monday', short: 'Mon', sessions: [{ time: '9:00 AM – 1:00 PM', tokens: 16, hours: '4 hours' }, { time: '2:00 PM – 4:00 PM', tokens: 8, hours: '2 hours' }] },
    { day: 'Tuesday', short: 'Tue', sessions: [{ time: '9:00 AM – 1:00 PM', tokens: 16, hours: '4 hours' }] },
    { day: 'Wednesday', short: 'Wed', sessions: [] },
    { day: 'Thursday', short: 'Thu', sessions: [{ time: '9:00 AM – 1:00 PM', tokens: 16, hours: '4 hours' }, { time: '2:00 PM – 4:00 PM', tokens: 8, hours: '2 hours' }] },
    { day: 'Friday', short: 'Fri', sessions: [{ time: '9:00 AM – 1:00 PM', tokens: 16, hours: '4 hours' }] },
    { day: 'Saturday', short: 'Sat', sessions: [] },
    { day: 'Sunday', short: 'Sun', sessions: [] },
  ]

  const [showModify, setShowModify] = useState(false)
  const [dayToggles, setDayToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(weekSchedule.map(d => [d.day, d.sessions.length > 0]))
  )
  const [dayShifts, setDayShifts] = useState<Record<string, { time: string; tokens: number; hours: string }[]>>(
    Object.fromEntries(weekSchedule.map(d => [d.day, d.sessions]))
  )

  const addShift = (day: string) =>
    setDayShifts(p => ({ ...p, [day]: [...p[day], { time: '09:00 AM – 01:00 PM', tokens: 16, hours: '4 hours' }] }))

  const removeShift = (day: string, idx: number) =>
    setDayShifts(p => ({ ...p, [day]: p[day].filter((_, i) => i !== idx) }))

  return (
    <div className="dp-container">
      <div className="dp-body">
        {/* Profile Card */}
        <div className="dp-profile-card">
          <img src={doctor.avatar} alt={doctor.name} className="dp-avatar" />
          <div className="dp-profile-info">
            <div className="dp-name-row">
              <span className="dp-name">{doctor.name}</span>
              <Badge text={doctor.status} {...statusProps[doctor.status]} />
            </div>
            <span className="dp-specialty">{doctor.specialty}</span>
            <div className="dp-info-row">
              {[
                { icon: qualificationIcon, value: 'MBBS, MD' },
                { icon: experienceIcon, value: doctor.experience },
                { icon: phoneIcon, value: doctor.phone },
              ].map((item, i) => (
                <div key={i} className="dp-info-item">
                  <img src={item.icon} alt="" />
                  <span className="dp-info-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="dp-info-row">
              {[
                { icon: emailIcon, value: doctor.email },
                { icon: buildingIcon, value: 'Full Time' },
                { icon: dollarIcon, value: '₹500' },
              ].map((item, i) => (
                <div key={i} className="dp-info-item">
                  <img src={item.icon} alt="" />
                  <span className="dp-info-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="dp-meta-text">
              Doctor ID: {doctor.id} &bull; Joined Mar 15, 2018
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dp-tabs">
          {(['Overview', 'Schedule', 'Leaves', 'Documents'] as const).map(tab => (
            <button key={tab} className={`dp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <div className="dp-overview">
            {/* Left 70% */}
            <div className="dp-overview-left">
              <div className="dp-stats-row">
                {[
                  { label: 'Monthly Patients', value: '124', icon: patientsGreenIcon },
                  { label: 'Total Patients', value: '1,840', icon: patientsRedIcon },
                  { label: 'Avg Time / Patient', value: '18 min', icon: clockBlueIcon },
                ].map(s => (
                  <div key={s.label} className="dp-stat-card">
                    <img src={s.icon} alt="" style={{ width: 20, height: 20, marginBottom: 8 }} />
                    <span className="dp-stat-value">{s.value}</span>
                    <span className="dp-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 30% */}
            <div className="dp-overview-right">
              <div className="dp-schedule-card">
                <div className="dp-schedule-title">This Week's Schedule</div>
                {weekSchedule.map((item) => (
                  <div key={item.short}>
                    <div className={`dp-schedule-row ${item.sessions.length === 0 ? 'dp-schedule-row-off' : ''}`}>
                      <span className="dp-schedule-day">{item.short}</span>
                      <div className="dp-schedule-sessions">
                        {item.sessions.length === 0
                          ? <span className="dp-schedule-off">Off</span>
                          : item.sessions.map(s => <span key={s.time} className="dp-schedule-session">{s.time}</span>)
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Schedule' && (
          <div className="dp-schedule-tab">
            <div className="dp-schedule-tab-header">
              <span className="dp-schedule-tab-title">This Week's Schedule</span>
              <button className="dp-modify-btn" onClick={() => setShowModify(true)}>Modify Schedule</button>
            </div>
            <div className="dp-week-grid">
              {weekSchedule.map(item => (
                <div key={item.day} className="dp-day-card">
                  <div className="dp-day-card-header">
                    <span className="dp-day-card-name">{item.day}</span>
                    <span className={`dp-day-badge ${item.sessions.length === 0 ? 'off' : ''}`}>
                      {item.sessions.length === 0 ? 'Off Day' : 'Working Day'}
                    </span>
                  </div>
                  {item.sessions.length > 0 && (
                    <div className="dp-day-sessions">
                      {item.sessions.map(s => (
                        <div key={s.time} className="dp-session-card">
                          <span className="dp-session-time">{s.time}</span>
                          <div className="dp-session-meta">
                            <span>Max {s.tokens} Tokens</span>
                            <span>{s.hours}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'Leaves' && (
          <div className="dp-schedule-tab">
            <div className="dp-schedule-tab-header">
              <span className="dp-schedule-tab-title">Leave History</span>
            </div>
            <table className="dp-table">
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>APPLIED DATE</th>
                  <th>REASON</th>
                  <th>START DATE</th>
                  <th>END DATE</th>
                  <th>DURATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { applied: 'Mar 10, 2026', reason: 'Medical', start: 'Mar 15, 2026', end: 'Mar 17, 2026', duration: '3 days', status: 'Approved' },
                  { applied: 'Feb 20, 2026', reason: 'Personal', start: 'Feb 25, 2026', end: 'Feb 25, 2026', duration: '1 day', status: 'Approved' },
                  { applied: 'Jan 5, 2026', reason: 'Family Emergency', start: 'Jan 8, 2026', end: 'Jan 10, 2026', duration: '3 days', status: 'Rejected' },
                ].map((l, i) => (
                  <tr key={i}>
                    <td>{l.applied}</td>
                    <td>{l.reason}</td>
                    <td>{l.start}</td>
                    <td>{l.end}</td>
                    <td>{l.duration}</td>
                    <td>
                      <span className={`dp-leave-status ${l.status === 'Approved' ? 'approved' : 'rejected'}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'Documents' && <div className="dp-tab-placeholder">Documents content coming soon.</div>}
      </div>

      {showModify && (
        <Modal onClose={() => setShowModify(false)}>
          <div style={{ width: 520 }}>
            <div className="sch-header">
              <h2 className="sch-title">Modify Schedule</h2>
              <button className="sch-close" onClick={() => setShowModify(false)}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body">
                {weekSchedule.map(item => (
                  <div key={item.day} className="dp-modify-day-row">
                    <div className="dp-modify-day-left">
                      <button
                        className={`dp-toggle ${dayToggles[item.day] ? 'on' : ''}`}
                        onClick={() => setDayToggles(p => ({ ...p, [item.day]: !p[item.day] }))}
                      ><span className="dp-toggle-thumb" /></button>
                      <div className="dp-modify-day-name">{item.day}</div>
                      {dayToggles[item.day] && (
                        <button className="dp-add-shift-btn" onClick={() => addShift(item.day)}>+ Add Shift</button>
                      )}
                    </div>
                    {dayToggles[item.day] && dayShifts[item.day].length > 0 && (
                      <div className="dp-modify-sessions">
                        {dayShifts[item.day].map((s, si) => (
                          <div key={si} className="dp-modify-session-item">
                            <div className="dp-modify-inputs">
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">Start Time</label>
                                <input type="time" className="dp-modify-input" defaultValue={s.time.split(' – ')[0].trim().replace(' AM', '').replace(' PM', '')} />
                              </div>
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">End Time</label>
                                <input type="time" className="dp-modify-input" defaultValue={s.time.split(' – ')[1].trim().replace(' AM', '').replace(' PM', '')} />
                              </div>
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">Max Tokens</label>
                                <input type="number" className="dp-modify-input" defaultValue={s.tokens} min={1} />
                              </div>
                              <button className="dp-remove-shift-btn" onClick={() => removeShift(item.day, si)}>✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="sch-divider" />
            <div className="ip-actions" style={{ padding: '16px 24px' }}>
              <button className="ip-btn ip-cancel" onClick={() => setShowModify(false)}>Cancel</button>
              <button className="ip-btn ip-submit">Save Changes</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default DoctorProfile
