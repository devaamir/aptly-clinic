import type { FC } from 'react'
import { useState, useEffect } from 'react'
import PatientModal from '../components/PatientModal'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import InstantPauseModal from '../components/InstantPauseModal'
import ScheduledPauseModal from '../components/ScheduledPauseModal'
import { getDoctors, getDoctorSchedule, subscribeQueue, updateAppointmentStatus } from '../services/api'
import type { AppointmentDoctor, DoctorSchedule, QueueSSEData } from '../services/types'
import { useAppContext } from '../context/AppContext'
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

const getEstimatedTime = (patients: any[], currentIndex: number, avgInterval: string): string => {
  const now = new Date()
  const intervalMins = parseInt(avgInterval) || 5
  
  // Count pending/ongoing patients before this one
  const patientsAhead = patients.slice(0, currentIndex).filter(p => 
    p.status === 'pending' || p.status === 'ongoing'
  ).length
  
  const estimatedMins = now.getMinutes() + (patientsAhead * intervalMins)
  const estimatedHours = now.getHours() + Math.floor(estimatedMins / 60)
  const finalMins = estimatedMins % 60
  
  return formatTime((estimatedHours % 24) * 60 + finalMins)
}

const statusBadgeProps: Record<Status, { bgColor: string; textColor: string; dotColor: string }> = {
  done: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  skipped: { bgColor: '#FFFAEB', textColor: '#B54708', dotColor: '#F79009' },
  ongoing: { bgColor: '#EFF8FF', textColor: '#175CD3', dotColor: '#2E90FA' },
  pending: { bgColor: '#F8F9FB', textColor: '#636A79', dotColor: '#98A2B3' },
  cancelled: { bgColor: '#FEF3F2', textColor: '#B42318', dotColor: '#F04438' },
}

type Status = 'done' | 'skipped' | 'ongoing' | 'pending' | 'cancelled'

interface Patient {
  appointmentId: string
  token: string
  name: string
  phone: string
  arrival: string
  status: Status
  avatar: string
  age: number
  gender: string
  isSilentConsult?: boolean
}

interface Session {
  scheduleId: string
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
  apiId: string
}

const mapApiDoctor = (d: AppointmentDoctor, idx: number): Doctor => ({
  id: idx + 1,
  apiId: d.id,
  name: d.name,
  specialty: d.specialties[0]?.name ?? '',
  room: `Room ${100 + idx}`,
  avatar: d.profilePicture || `https://i.pravatar.cc/40?u=${d.id}`,
  sessions: [],
})
const mapScheduleToSession = (s: DoctorSchedule): Session => {
  const now = new Date()
  const currentMins = now.getHours() * 60 + now.getMinutes()
  const [startH, startM] = s.startTime.slice(0, 5).split(':').map(Number)
  const startMins = startH * 60 + startM
  const isLive = currentMins >= startMins

  const to12h = (time: string) => {
    const [h, m] = time.slice(0, 5).split(':').map(Number)
    const ampm = h >= 12 ? 'pm' : 'am'
    const h12 = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')}${ampm}`
  }

  const startLabel = to12h(s.startTime)
  const stopLabel = to12h(s.stopTime)

  return {
    scheduleId: s.id,
    label: `${startLabel} to ${stopLabel}`,
    workingTime: `${startLabel} to ${stopLabel}`,
    totalPatient: s.tokenLimit,
    completedPatient: s.tokenLimit - s.remainingTokenCount,
    avgInterval: '10 minutes',
    isLive,
    patients: [],
  }
}

const formatTo12h = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

const QueueManagement: FC = () => {
  const { activeContext } = useAppContext()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedId, setSelectedId] = useState(1)
  const [sessionIdx, setSessionIdx] = useState(0)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [patientsMap, setPatientsMap] = useState<Record<string, Patient[]>>({})
  const [statsMap, setStatsMap] = useState<Record<string, { completedPatient: number; totalPatient: number }>>({})

  useEffect(() => {
    getDoctors().then(res => {
      if (res.success && res.data.length > 0) {
        const mapped = res.data.map(mapApiDoctor)
        setDoctors(mapped)
        setSelectedId(mapped[0].id)
      }
    }).catch(() => { })
  }, [activeContext?.medicalCenter.id])

  useEffect(() => {
    const doc = doctors.find(d => d.id === selectedId)
    if (!doc?.apiId || !activeContext?.medicalCenter.id) return
    const today = new Date().toISOString().split('T')[0]
    getDoctorSchedule(doc.apiId, today, activeContext.medicalCenter.id).then(res => {
      if (res.success) {
        setDoctors(prev => prev.map(d =>
          d.id === selectedId ? { ...d, sessions: res.data.map(mapScheduleToSession) } : d
        ))
        setSessionIdx(0)
      }
    }).catch(() => { })
  }, [selectedId, doctors.length])

  // SSE: subscribe to queue for the active session
  useEffect(() => {
    const doc = doctors.find(d => d.id === selectedId)
    const scheduleId = doc?.sessions[sessionIdx]?.scheduleId
    if (!scheduleId) return
    const es = subscribeQueue(scheduleId, (data: QueueSSEData) => {
      const mapped: Patient[] = data.appointments.map((a, i) => ({
        appointmentId: a.id,
        token: String(a.tokenNumber).padStart(2, '0'),
        name: a.patient.name,
        phone: a.patient.phoneNumber,
        arrival: new Date(a.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        age: new Date().getFullYear() - new Date(a.patient.dateOfBirth).getFullYear(),
        gender: a.patient.gender,
        avatar: `https://i.pravatar.cc/32?u=${i}`,
        status: (a.tokenStatus === 'done' ? 'done' : a.tokenStatus === 'skipped' ? 'skipped' : a.tokenStatus === 'cancelled' ? 'cancelled' : a.tokenStatus === 'ongoing' ? 'ongoing' : 'pending') as Status,
      }))
      setPatientsMap(prev => ({ ...prev, [`${selectedId}-${sessionIdx}`]: mapped }))
      
      // Update avgInterval from first appointment's doctor data
      if (data.appointments.length > 0 && doc) {
        const avgMins = data.appointments[0].doctor.estimateConsultationTime
        setDoctors(prev => prev.map(d => 
          d.id === selectedId ? {
            ...d,
            sessions: d.sessions.map((s, i) => 
              i === sessionIdx ? { ...s, avgInterval: `${avgMins} minutes` } : s
            )
          } : d
        ))
      }
    })
    return () => es.close()
  }, [selectedId, sessionIdx, doctors])

  const doctor = doctors.find(d => d.id === selectedId) ?? doctors[0]
  const session = doctor?.sessions[sessionIdx] ?? doctor?.sessions[0]
  const sessionKey = `${selectedId}-${sessionIdx}`
  const patients = patientsMap[sessionKey] ?? session?.patients ?? []
  const completedCount = patients.filter(p => p.status === 'done').length
  const stats = statsMap[sessionKey] ?? { 
    completedPatient: completedCount, 
    totalPatient: patients.length || session?.totalPatient || 0 
  }

  const allConsulted = patients.length > 0 && patients.every(p => 
    p.status === 'done' || 
    p.status === 'cancelled' || 
    p.status === 'skipped' || 
    (p.status === 'ongoing' && p.isSilentConsult)
  )

  const updatePatients = (updated: Patient[]) =>
    setPatientsMap(prev => ({ ...prev, [sessionKey]: updated }))

  const updateStats = (delta: { completedPatient?: number; totalPatient?: number }) =>
    setStatsMap(prev => ({ ...prev, [sessionKey]: { ...prev[sessionKey], ...delta } }))

  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showScheduledModal, setShowScheduledModal] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [showNextConfirm, setShowNextConfirm] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [nextLoading, setNextLoading] = useState(false)
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

  const handleCancelToken = async () => {
    if (!selectedPatient || selectedPatient.status !== 'pending') return
    try {
      const response = await updateAppointmentStatus(selectedPatient.appointmentId, 'cancelled')
      if (response.success) {
        updatePatients(patients.map(p => p.token === selectedPatient.token ? { ...p, status: 'cancelled' } : p))
        closeModal()
      }
    } catch { /* silent */ }
  }

  const handleConsult = async (patient: Patient) => {
    if (patient.status !== 'skipped') return
    
    try {
      const response = await updateAppointmentStatus(patient.appointmentId, 'ongoing')
      if (response.success) {
        console.log('Setting patient to ongoing with isSilentConsult=true')
        updatePatients(patients.map(p => p.token === patient.token ? { ...p, status: 'ongoing', isSilentConsult: true } : p))
      }
    } catch { /* silent */ }
  }

  const handleDone = async (patient: Patient) => {
    if (patient.status !== 'ongoing' || !patient.isSilentConsult) return
    try {
      const response = await updateAppointmentStatus(patient.appointmentId, 'done')
      if (response.success) {
        updatePatients(patients.map(p => p.token === patient.token ? { ...p, status: 'done', isSilentConsult: false } : p))
        updateStats({ completedPatient: stats.completedPatient + 1 })
      }
    } catch { /* silent */ }
  }

  const handleNextToken = async () => {
    const ongoingIdx = patients.findIndex(p => p.status === 'ongoing')
    if (ongoingIdx === -1) {
      // Show confirmation modal for Start Now
      setShowStartConfirm(true)
      return
    }
    
    // Show confirmation modal for Next Token
    setShowNextConfirm(true)
  }

  const handleConfirmStart = async () => {
    const firstPending = patients.findIndex(p => p.status === 'pending')
    if (firstPending === -1) return
    setStartLoading(true)
    try {
      const response = await updateAppointmentStatus(patients[firstPending].appointmentId, 'ongoing')
      if (response.success) {
        updatePatients(patients.map((p, i) => i === firstPending ? { ...p, status: 'ongoing' } : p))
        setShowStartConfirm(false)
      }
    } catch { /* silent */ } finally {
      setStartLoading(false)
    }
  }

  const handleConfirmNext = async () => {
    const ongoingIdx = patients.findIndex(p => p.status === 'ongoing')
    if (ongoingIdx === -1) return
    
    setNextLoading(true)
    try {
      const response = await updateAppointmentStatus(patients[ongoingIdx].appointmentId, 'done')
      if (response.success) {
        const nextPending = patients.findIndex((p, i) => i > ongoingIdx && p.status === 'pending')
        if (nextPending !== -1) {
          const nextResponse = await updateAppointmentStatus(patients[nextPending].appointmentId, 'ongoing')
          if (nextResponse.success) {
            updatePatients(patients.map((p, i) => {
              if (i === ongoingIdx) return { ...p, status: 'done' }
              if (i === nextPending) return { ...p, status: 'ongoing' }
              return p
            }))
          }
        } else {
          updatePatients(patients.map((p, i) => i === ongoingIdx ? { ...p, status: 'done' } : p))
        }
        updateStats({ completedPatient: stats.completedPatient + 1 })
        setShowNextConfirm(false)
      }
    } catch { /* silent */ } finally {
      setNextLoading(false)
    }
  }

  const handleSkip = async () => {
    const ongoingIdx = patients.findIndex(p => p.status === 'ongoing')
    if (ongoingIdx === -1) return
    const nextPending = patients.findIndex((p, i) => i > ongoingIdx && p.status === 'pending')
    if (nextPending !== -1) {
      try {
        const response = await updateAppointmentStatus(patients[nextPending].appointmentId, 'ongoing')
        if (response.success) {
          updatePatients(patients.map((p, i) => {
            if (i === ongoingIdx) return { ...p, status: 'skipped' }
            if (i === nextPending) return { ...p, status: 'ongoing' }
            return p
          }))
        }
      } catch { /* silent */ }
    } else {
      updatePatients(patients.map((p, i) => i === ongoingIdx ? { ...p, status: 'skipped' } : p))
    }
  }

  if (!doctor) return <div style={{ padding: 24, fontFamily: 'Manrope', color: '#636A79' }}>Loading...</div>

  return (
    <div className="qm-container">
      {/* Header */}
      <PageHeader
        title="Queue Management"
        actions={
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
        }
      />

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

        {!session ? (
          <div style={{ padding: 48, textAlign: 'center', fontFamily: 'Manrope', color: '#636A79', fontSize: 16 }}>
            No schedule today for this doctor.
          </div>
        ) : (
          <>
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

        {allConsulted && session.isLive && (
          <div className="session-banner">
            All patients have been consulted. Waiting for new appointments or session end time.
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
            <button className="action-btn" disabled={!session.isLive || !!pausedDuration || !patients.some(p => p.status === 'ongoing')} onClick={handleSkip}><img src={skipIcon} alt="" className="btn-icon" /> Skip</button>
            <button className="action-btn next-token" disabled={!session.isLive || !!pausedDuration || allConsulted} onClick={handleNextToken}>
              {!patients.some(p => p.status === 'ongoing') && patients.some(p => p.status === 'pending') && !patients.some(p => p.status === 'done' || p.status === 'skipped') ? 'Start Now' : 'Next Token'} <img src={rightArrow} alt="" className="btn-icon" />
            </button>
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
                {patients.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#A0A5B1', fontSize: 14, fontFamily: 'Manrope' }}>No patients in queue</td></tr>
                ) : patients.map((p, idx) => (
                  <tr key={p.token} className={p.status === 'ongoing' && !p.isSilentConsult ? 'row-current' : ''}>
                    <td>
                      <span className={`token-badge ${p.status === 'ongoing' && !p.isSilentConsult ? 'token-current' : ''}`}>
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
                    <td>{getEstimatedTime(patients, idx, session.avgInterval)}</td>
                    <td><Badge text={p.status} {...statusBadgeProps[p.status]} /></td>
                    <td>
                      <div className="row-actions">
                        {p.status === 'skipped' && (
                          <button className="action-btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => handleConsult(p)}>Consult</button>
                        )}
                        {p.status === 'ongoing' && p.isSilentConsult && (
                          <button className="action-btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => handleDone(p)}>Done</button>
                        )}
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
                <div key={p.token} onClick={() => openModal(p)} className={`grid-token ${p.status === 'ongoing' && !p.isSilentConsult ? 'grid-token-current' : ''} ${p.status === 'done' ? 'grid-token-completed' : ''} ${p.status === 'skipped' ? 'grid-token-skipped' : ''} ${p.status === 'cancelled' ? 'grid-token-cancelled' : ''} ${p.status === 'pending' ? 'grid-token-waiting' : ''}`}>
                  <span className="grid-token-number">{p.token}</span>
                  {p.status !== 'ongoing' && p.status !== 'pending' && (
                    <Badge text={p.status} {...statusBadgeProps[p.status]} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} icon={<img src={verifyTickGreen} alt="" />} />}

      {showStartConfirm && (
        <Modal onClose={() => setShowStartConfirm(false)}>
          <div style={{ width: 400, padding: 24 }}>
            <h2 style={{ margin: 0, marginBottom: 16, fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, color: '#1A1D1F' }}>
              Start Appointments
            </h2>
            <p style={{ margin: 0, marginBottom: 24, fontFamily: 'Manrope', fontSize: 14, color: '#636A79' }}>
              Are you sure you want to start the appointments? This will begin the consultation queue.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="ip-btn ip-cancel" onClick={() => setShowStartConfirm(false)} disabled={startLoading}>Cancel</button>
              <button className="ip-btn ip-submit" onClick={handleConfirmStart} disabled={startLoading}>
                {startLoading ? 'Starting...' : 'Start Now'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showNextConfirm && (
        <Modal onClose={() => setShowNextConfirm(false)}>
          <div style={{ width: 400, padding: 24 }}>
            <h2 style={{ margin: 0, marginBottom: 16, fontFamily: 'Manrope', fontSize: 20, fontWeight: 600, color: '#1A1D1F' }}>
              Complete Consultation
            </h2>
            <p style={{ margin: 0, marginBottom: 24, fontFamily: 'Manrope', fontSize: 14, color: '#636A79' }}>
              Have you completed the consultation? This will mark the current patient as done and move to the next token.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="ip-btn ip-cancel" onClick={() => setShowNextConfirm(false)} disabled={nextLoading}>Cancel</button>
              <button className="ip-btn ip-submit" onClick={handleConfirmNext} disabled={nextLoading}>
                {nextLoading ? 'Processing...' : 'Next Token'}
              </button>
            </div>
          </div>
        </Modal>
      )}

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
