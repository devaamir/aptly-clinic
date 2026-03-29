import type { FC } from 'react'
import { useState, useEffect } from 'react'
import PatientModal from '../components/PatientModal'
import InstantPauseModal from '../components/InstantPauseModal'
import ScheduledPauseModal from '../components/ScheduledPauseModal'
import verifyTickGreen from '../assets/icons/verify-tick-green.svg'
import infoIconBlue from '../assets/icons/info-icon-blue.svg'
import Toast from '../components/Toast'
import searchIcon from '../assets/icons/search-icon.svg'
import upDownArrow from '../assets/icons/up-down-arrow.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import settingsIconsIcon from '../assets/icons/settings-icons.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import listIcon from '../assets/icons/list-icon.svg'
import gridIcon from '../assets/icons/grid-icon.svg'
import instantPauseIcon from '../assets/icons/instant-pause.svg'
import scheduledPauseIcon from '../assets/icons/scheduled-pause.svg'
import skipIcon from '../assets/icons/skip-icon.svg'
import rightArrow from '../assets/icons/right-arrow.svg'
import phoneIcon from '../assets/icons/phone-icon.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import Badge from '../components/Badge'
import './QueueManagement.css'

const parseMinutes = (time: string): number => {
  const t = time.toLowerCase().replace(/\s/g, '')
  const isPM = t.includes('pm')
  const [h, m] = t.replace(/[apm]/g, '').split(':').map(Number)
  return ((isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h)) * 60) + (m || 0)
}

const formatTime = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 || 12
  return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`
}

const getEstimatedTime = (tokenIndex: number, workingTime: string, avgInterval: string): string => {
  const startTime = workingTime.split(' - ')[0]
  const intervalMins = parseInt(avgInterval) || 5
  return formatTime(parseMinutes(startTime) + tokenIndex * intervalMins)
}

const statusBadgeProps: Record<Status, { bgColor: string; textColor: string; dotColor: string }> = {
  Completed: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Skipped: { bgColor: '#FFFAEB', textColor: '#B54708', dotColor: '#F79009' },
  Current: { bgColor: '#EFF8FF', textColor: '#175CD3', dotColor: '#2E90FA' },
  Waiting: { bgColor: '#F8F9FB', textColor: '#636A79', dotColor: '#98A2B3' },
  Cancelled: { bgColor: '#FEF3F2', textColor: '#B42318', dotColor: '#F04438' },
}

type Status = 'Completed' | 'Skipped' | 'Current' | 'Waiting' | 'Cancelled'

interface Patient {
  token: string
  name: string
  phone: string
  arrival: string
  status: Status
  avatar: string
  age: number
  gender: string
}

interface Session {
  label: string
  workingTime: string
  totalPatient: number
  completedPatient: number
  avgInterval: string
  isLive: boolean
  patients: Patient[]
}

interface Doctor {
  id: number
  name: string
  specialty: string
  room: string
  avatar: string
  sessions: Session[]
}

const doctors: Doctor[] = [
  {
    id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', room: 'Room 100',
    avatar: 'https://i.pravatar.cc/40?img=1',
    sessions: [
      {
        label: '9am - 1pm', workingTime: '9:00am - 1:00pm', totalPatient: 60, completedPatient: 3, avgInterval: '8 minutes', isLive: false,
        patients: [
          { token: '01', name: 'Alice Brown', phone: '+91 90487 1111', arrival: '09:00 AM', age: 32, gender: 'Male', status: 'Completed', avatar: 'https://i.pravatar.cc/32?img=20' },
          { token: '02', name: 'Bob Martin', phone: '+91 90487 2222', arrival: '09:15 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=21' },
          { token: '03', name: 'Carol White', phone: '+91 90487 3333', arrival: '09:30 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=22' },
        ],
      },
    ],
  },
  {
    id: 2, name: 'Dr. Daniel Hamilton', specialty: 'Cardiology', room: 'Room 101',
    avatar: 'https://i.pravatar.cc/40?img=2',
    sessions: [
      {
        label: '8am - 11:30am', workingTime: '8:00am - 11:30am', totalPatient: 84, completedPatient: 5, avgInterval: '5 minutes', isLive: true,
        patients: [
          { token: '01', name: 'Katie Sims', phone: '+91 90487 8290', arrival: '09:00 AM', age: 32, gender: 'Male', status: 'Completed', avatar: 'https://i.pravatar.cc/32?img=5' },
          { token: '02', name: 'Ricky Smith', phone: '+91 90487 8290', arrival: '09:00 AM', age: 32, gender: 'Male', status: 'Completed', avatar: 'https://i.pravatar.cc/32?img=6' },
          { token: '03', name: 'Autumn Phillips', phone: '+91 90487 8290', arrival: '09:00 AM', age: 45, gender: 'Male', status: 'Skipped', avatar: 'https://i.pravatar.cc/32?img=7' },
          { token: '04', name: 'Jerry Helfer', phone: '+91 90487 8290', arrival: '09:00 AM', age: 38, gender: 'Male', status: 'Current', avatar: 'https://i.pravatar.cc/32?img=8' },
          { token: '05', name: 'Rodger Struck', phone: '+91 90487 8290', arrival: '09:00 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=9' },
          { token: '06', name: 'Bradley Lawlor', phone: '+91 90487 8290', arrival: '09:00 AM', age: 52, gender: 'Female', status: 'Cancelled', avatar: 'https://i.pravatar.cc/32?img=10' },
          { token: '07', name: 'Chris Glasser', phone: '+91 90487 8290', arrival: '09:00 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=11' },
          { token: '08', name: 'John Dukes', phone: '+91 90487 8290', arrival: '09:00 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=12' },
          { token: '09', name: 'Judith Rodriguez', phone: '+91 90487 8290', arrival: '09:00 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=13' },
          { token: '10', name: 'James Hall', phone: '+91 90487 8290', arrival: '09:00 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=14' },
          { token: '11', name: 'Kenneth Allen', phone: '+91 90487 8290', arrival: '09:00 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=15' },
        ],
      },
      {
        label: '2pm - 5pm', workingTime: '2:00pm - 5:00pm', totalPatient: 40, completedPatient: 0, avgInterval: '5 minutes', isLive: false,
        patients: [
          { token: '01', name: 'Leo Grant', phone: '+91 90487 6666', arrival: '02:00 PM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=18' },
          { token: '02', name: 'Sara Kim', phone: '+91 90487 7777', arrival: '02:15 PM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=19' },
        ],
      },
    ],
  },
  {
    id: 3, name: 'Dr. Daniel Hamilton', specialty: 'Neurology', room: 'Room 102',
    avatar: 'https://i.pravatar.cc/40?img=3',
    sessions: [
      {
        label: '10am - 2pm', workingTime: '10:00am - 2:00pm', totalPatient: 45, completedPatient: 2, avgInterval: '10 minutes', isLive: true,
        patients: [
          { token: '01', name: 'Mark Spencer', phone: '+91 90487 4444', arrival: '10:00 AM', age: 38, gender: 'Male', status: 'Current', avatar: 'https://i.pravatar.cc/32?img=16' },
          { token: '02', name: 'Nina Patel', phone: '+91 90487 5555', arrival: '10:10 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=17' },
        ],
      },
    ],
  },
  {
    id: 4, name: 'Dr. Michael Chen', specialty: 'Orthopedics', room: 'Room 103',
    avatar: 'https://i.pravatar.cc/40?img=4',
    sessions: [
      {
        label: '11am - 3pm', workingTime: '11:00am - 3:00pm', totalPatient: 30, completedPatient: 0, avgInterval: '12 minutes', isLive: false,
        patients: [
          { token: '01', name: 'Leo Grant', phone: '+91 90487 6666', arrival: '11:00 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=18' },
          { token: '02', name: 'Sara Kim', phone: '+91 90487 7777', arrival: '11:15 AM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=19' },
        ],
      },
      {
        label: '5pm - 8pm', workingTime: '5:00pm - 8:00pm', totalPatient: 20, completedPatient: 0, avgInterval: '12 minutes', isLive: false,
        patients: [
          { token: '01', name: 'Emma Wilson', phone: '+91 90487 8888', arrival: '05:00 PM', age: 28, gender: 'Female', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=25' },
        ],
      },
    ],
  },
]
const formatTo12h = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

const QueueManagement: FC = () => {
  const [selectedId, setSelectedId] = useState(2)
  const [sessionIdx, setSessionIdx] = useState(0)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [patientsMap, setPatientsMap] = useState<Record<string, Patient[]>>(
    () => Object.fromEntries(doctors.flatMap(d => d.sessions.map((s, i) => [`${d.id}-${i}`, s.patients])))
  )
  const [statsMap, setStatsMap] = useState<Record<string, { completedPatient: number; totalPatient: number }>>(
    () => Object.fromEntries(doctors.flatMap(d => d.sessions.map((s, i) => [`${d.id}-${i}`, { completedPatient: s.completedPatient, totalPatient: s.totalPatient }])))
  )

  const doctor = doctors.find(d => d.id === selectedId)!
  const session = doctor.sessions[sessionIdx] ?? doctor.sessions[0]
  const sessionKey = `${selectedId}-${sessionIdx}`
  const patients = patientsMap[sessionKey] ?? session.patients
  const stats = statsMap[sessionKey] ?? { completedPatient: session.completedPatient, totalPatient: session.totalPatient }

  const updatePatients = (updated: Patient[]) =>
    setPatientsMap(prev => ({ ...prev, [sessionKey]: updated }))

  const updateStats = (delta: { completedPatient?: number; totalPatient?: number }) =>
    setStatsMap(prev => ({ ...prev, [sessionKey]: { ...prev[sessionKey], ...delta } }))

  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showScheduledModal, setShowScheduledModal] = useState(false)
  const [pausedMap, setPausedMap] = useState<Record<string, string | null>>({})
  const [scheduledMap, setScheduledMap] = useState<Record<string, { startAt: string; duration: string } | null>>({})

  const pausedDuration = pausedMap[sessionKey] ?? null
  const scheduledPause = scheduledMap[sessionKey] ?? null
  const setPausedDuration = (val: string | null) => setPausedMap(prev => ({ ...prev, [sessionKey]: val }))
  const setScheduledPause = (val: { startAt: string; duration: string } | null) => setScheduledMap(prev => ({ ...prev, [sessionKey]: val }))

  useEffect(() => {
    if (!scheduledPause) return
    const interval = setInterval(() => {
      const now = new Date().toTimeString().slice(0, 5)
      if (now >= scheduledPause.startAt) {
        setPausedDuration(scheduledPause.duration)
        setScheduledPause(null)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [scheduledPause, sessionKey])
  const [toast, setToast] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null)

  const openModal = (p: typeof patients[0]) => setSelectedPatient(p)
  const closeModal = () => setSelectedPatient(null)

  const handleCancelToken = () => {
    if (!selectedPatient) return
    updatePatients(patients.map(p => p.token === selectedPatient.token ? { ...p, status: 'Cancelled' as const } : p))
    closeModal()
  }

  const handleNextToken = () => {
    const currentIdx = patients.findIndex(p => p.status === 'Current')
    if (currentIdx === -1) {
      const firstWaiting = patients.findIndex(p => p.status === 'Waiting')
      if (firstWaiting === -1) return
      updatePatients(patients.map((p, i) => i === firstWaiting ? { ...p, status: 'Current' } : p))
    } else {
      updatePatients(patients.map((p, i) => {
        if (i === currentIdx) return { ...p, status: 'Completed' }
        if (i === currentIdx + 1 && p.status === 'Waiting') return { ...p, status: 'Current' }
        return p
      }))
      updateStats({ completedPatient: stats.completedPatient + 1 })
    }
  }

  const handleSkip = () => {
    const currentIdx = patients.findIndex(p => p.status === 'Current')
    if (currentIdx === -1) return
    updatePatients(patients.map((p, i) => {
      if (i === currentIdx) return { ...p, status: 'Skipped' }
      if (i === currentIdx + 1 && p.status === 'Waiting') return { ...p, status: 'Current' }
      return p
    }))
  }

  return (
    <div className="qm-container">
      {/* Header */}
      <div className="qm-header">
        <h1 className="qm-title">Queue Management</h1>
        <div className="qm-header-actions">
          <button className="qm-icon-btn"><img src={searchIcon} alt="search" /></button>
          <button className="qm-icon-btn"><img src={upDownArrow} alt="sort" /></button>
          <button className="qm-icon-btn"><img src={sortIcon} alt="filter" /></button>
          <button className="qm-icon-btn"><img src={settingsIconsIcon} alt="settings" /></button>
          <button className="qm-icon-btn"><img src={reloadIcon} alt="reload" /></button>
          <div className="view-toggle">
            <button className={`qm-icon-btn view-btn ${view === 'list' ? 'view-active' : ''}`} onClick={() => setView('list')}><img src={listIcon} alt="list" /></button>
            <button className={`qm-icon-btn view-btn ${view === 'grid' ? 'view-active' : ''}`} onClick={() => setView('grid')}><img src={gridIcon} alt="grid" /></button>
          </div>
        </div>
      </div>

      {/* Doctor Tabs */}
      <div className="qm-doctor-tabs">
        {doctors.map(doc => (
          <div
            key={doc.id}
            className={`qm-doctor-tab ${doc.id === selectedId ? 'active' : ''}`}
            onClick={() => { setSelectedId(doc.id); setSessionIdx(0) }}
          >
            <img src={doc.avatar} alt={doc.name} className="tab-avatar" />
            <span className="tab-name" style={{ color: doc.id === selectedId ? 'var(--color-accent)' : 'var(--color-tabText)' }}>{doc.name}</span>
          </div>
        ))}
      </div>

      {/* Main White Container */}
      <div className="qm-main-card">

        {/* Session Tabs */}
        <div className="session-tabs">
          {doctor.sessions.map((s, i) => (
            <button
              key={i}
              className={`session-tab ${sessionIdx === i ? 'active' : ''}`}
              onClick={() => setSessionIdx(i)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Doctor Card */}
        {pausedDuration ? (
          <div className="session-banner pause-banner">
            <div className="pause-banner-left">
              <img src={instantPauseIcon} alt="" className="banner-icon" />
              <span>Queue is paused for {pausedDuration}. Waiting patients have been notified. Resume to continue the queue.</span>
            </div>
            <button className="resume-btn" onClick={() => { setPausedDuration(null); setToast('Successfully Resumed') }}>Resume</button>
          </div>
        ) : !session.isLive && (
          <div className="session-banner">
            Queue hasn't started yet. Scheduled to begin at {session.workingTime.split(' - ')[0]}.
          </div>
        )}

        {scheduledPause && (
          <div className="session-banner scheduled-banner">
            <div className="pause-banner-left">
              <img src={infoIconBlue} alt="" className="banner-icon" />
              <span>Scheduled pause started at {formatTo12h(scheduledPause.startAt)} for {scheduledPause.duration}.</span>
            </div>
            <button className="cancel-schedule-btn" onClick={() => setScheduledPause(null)}>Cancel Schedule</button>
          </div>
        )}
        <div className="qm-doctor-card">
          <div className="doctor-info">
            <img src={doctor.avatar} alt={doctor.name} className="doctor-avatar" />
            <div>
              <h2 className="doctor-name">{doctor.name}</h2>
              <p className="doctor-meta">{doctor.specialty} • {doctor.room}</p>
            </div>
            {session.isLive && <Badge text="Live" bgColor="#ECFDF3" textColor="#027A48" dotColor="#12B76A" />}
          </div>
          <div className="doctor-actions">
            <button className="action-btn" disabled={!session.isLive || !!pausedDuration} onClick={() => setShowPauseModal(true)}><img src={instantPauseIcon} alt="" className="btn-icon" /> Instant Pause</button>
            <button className="action-btn" disabled={!session.isLive || !!pausedDuration} onClick={() => setShowScheduledModal(true)}><img src={scheduledPauseIcon} alt="" className="btn-icon" /> Scheduled Pause</button>
            <button className="action-btn" disabled={!session.isLive || !!pausedDuration} onClick={handleSkip}><img src={skipIcon} alt="" className="btn-icon" /> Skip</button>
            <button className="action-btn next-token" disabled={!session.isLive || !!pausedDuration} onClick={handleNextToken}>Next Token <img src={rightArrow} alt="" className="btn-icon" /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="qm-stats">
          <div className="stat-item">
            <span className="stat-label">Working Time</span>
            <span className="stat-value">{session.workingTime}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Patient</span>
            <span className="stat-value">{stats.totalPatient}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed Patient</span>
            <span className="stat-value">{stats.completedPatient}</span>
          </div>
          <div className="stat-item" style={{ borderRight: '0' }}>
            <span className="stat-label">Average Interval</span>
            <span className="stat-value">{session.avgInterval}</span>
          </div>
        </div>

        {/* Queue Table / Grid */}
        <div className="qm-table-wrapper">
          {view === 'list' ? (
            <table className="qm-table">
              <thead>
                <tr>
                  <th>TOKEN</th>
                  <th>PATIENT</th>
                  <th>PHONE</th>
                  <th>EST. TIME</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={p.token} className={p.status === 'Current' ? 'row-current' : ''}>
                    <td>
                      <span className={`token-badge ${p.status === 'Current' ? 'token-current' : ''}`}>
                        {p.token}
                      </span>
                    </td>
                    <td>
                      <div className="patient-cell">
                        <img src={p.avatar} alt={p.name} className="patient-avatar" />
                        {p.name}
                      </div>
                    </td>
                    <td>{p.phone}</td>
                    <td>{getEstimatedTime(idx, session.workingTime, session.avgInterval)}</td>
                    <td><Badge text={p.status} {...statusBadgeProps[p.status]} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="qm-icon-btn dots-btn" onClick={() => openModal(p)}><img src={dotsIcon} alt="more" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="qm-grid">
              {patients.map(p => (
                <div key={p.token} onClick={() => openModal(p)} className={`grid-token ${p.status === 'Current' ? 'grid-token-current' : ''} ${p.status === 'Completed' ? 'grid-token-completed' : ''} ${p.status === 'Skipped' ? 'grid-token-skipped' : ''} ${p.status === 'Cancelled' ? 'grid-token-cancelled' : ''} ${p.status === 'Waiting' ? 'grid-token-waiting' : ''}`}>
                  <span className="grid-token-number">{p.token}</span>
                  {p.status !== 'Current' && p.status !== 'Waiting' && (
                    <Badge text={p.status} {...statusBadgeProps[p.status]} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} icon={<img src={verifyTickGreen} alt="" />} />}

      {showScheduledModal && (
        <ScheduledPauseModal
          onClose={() => setShowScheduledModal(false)}
          onSubmit={(startAt, duration) => { setScheduledPause({ startAt, duration }); setShowScheduledModal(false) }}
        />
      )}

      {showPauseModal && (
        <InstantPauseModal
          onClose={() => setShowPauseModal(false)}
          onSubmit={(duration) => { setPausedDuration(duration); setShowPauseModal(false) }}
        />
      )}

      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={closeModal}
          onCall={() => { window.location.href = `tel:${selectedPatient.phone}`; closeModal() }}
          onCancel={handleCancelToken}
        />
      )}
    </div>
  )
}

export default QueueManagement
