import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { getDoctorSchedule, updateDoctorSchedule } from '../services/api'
import { useAppContext } from '../context/AppContext'
import Modal from '../components/Modal'
import type { DoctorSchedule as DoctorScheduleType } from '../services/types'
import './DoctorProfile.css'
import './QueueManagement.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type ShiftRow = { id?: string; startTime: string; stopTime: string; tokenLimit: number }

const to12Hour = (time: string) => {
  const [h, m] = time.slice(0, 5).split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

const DoctorSchedulePage: FC = () => {
  const { activeDoctor, activeContext } = useAppContext()
  const [schedules, setSchedules] = useState<DoctorScheduleType[]>([])
  const [loading, setLoading] = useState(true)
  const [showModify, setShowModify] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState('')

  const weekSchedule = DAYS.map(day => ({
    day,
    sessions: schedules.filter(s => s.dayOfWeek.toLowerCase() === day.toLowerCase()),
  }))

  const initShifts = () => Object.fromEntries(
    DAYS.map(day => [day, schedules
      .filter(s => s.dayOfWeek.toLowerCase() === day.toLowerCase())
      .map(s => ({ id: s.id, startTime: s.startTime.slice(0, 5), stopTime: s.stopTime.slice(0, 5), tokenLimit: s.tokenLimit }))
    ])
  )

  const [dayToggles, setDayToggles] = useState<Record<string, boolean>>({})
  const [dayShifts, setDayShifts] = useState<Record<string, ShiftRow[]>>({})

  useEffect(() => {
    if (!activeDoctor?.id || !activeContext?.medicalCenter.id) return

    // Get the dates for each day of the current week (Mon–Sun)
    const getDateForDay = (dayName: string): string => {
      const dayIndex = DAYS.indexOf(dayName) // 0=Mon, 6=Sun
      const now = new Date()
      const todayIndex = (now.getDay() + 6) % 7 // convert Sun=0 to Mon=0
      const diff = dayIndex - todayIndex
      const target = new Date(now)
      target.setDate(now.getDate() + diff)
      return target.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    }

    setLoading(true)
    Promise.all(
      DAYS.map(day =>
        getDoctorSchedule(activeDoctor.id, getDateForDay(day), activeContext.medicalCenter.id)
          .then(res => (res.success ? res.data : []))
          .catch(() => [])
      )
    ).then(results => {
      // results[i] = schedules for DAYS[i], tag each with its dayOfWeek
      const all = results.flatMap((daySchedules, i) =>
        daySchedules.map(s => ({ ...s, dayOfWeek: DAYS[i].toLowerCase() }))
      )
      // deduplicate by id
      const seen = new Set<string>()
      const unique = all.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true })
      setSchedules(unique)
    }).finally(() => setLoading(false))
  }, [activeDoctor?.id, activeContext?.medicalCenter.id])

  const openModify = () => {
    const shifts = initShifts()
    setDayShifts(shifts)
    setDayToggles(Object.fromEntries(DAYS.map(day => [day, shifts[day].length > 0])))
    setScheduleError('')
    setShowModify(true)
  }

  const addShift = (day: string) =>
    setDayShifts(p => ({ ...p, [day]: [...p[day], { startTime: '09:00', stopTime: '17:00', tokenLimit: 20 }] }))

  const removeShift = (day: string, idx: number) => {
    const remaining = dayShifts[day].filter((_, i) => i !== idx)
    setDayShifts(p => ({ ...p, [day]: remaining }))
    if (remaining.length === 0) setDayToggles(p => ({ ...p, [day]: false }))
  }

  const updateShift = (day: string, idx: number, field: keyof ShiftRow, value: string | number) =>
    setDayShifts(p => ({ ...p, [day]: p[day].map((s, i) => i === idx ? { ...s, [field]: value } : s) }))

  const handleSaveSchedule = async () => {
    if (!activeDoctor?.id) return
    const originalIds = new Set(schedules.map(s => s.id))
    const toAdd: { dayOfWeek: string; startTime: string; stopTime: string; tokenLimit: number }[] = []
    const toUpdate: { id: string; startTime: string; stopTime: string; tokenLimit: number }[] = []
    const keptIds = new Set<string>()

    DAYS.forEach(day => {
      if (!dayToggles[day]) return
      dayShifts[day].forEach(s => {
        const startTime = s.startTime + ':00'
        const stopTime = s.stopTime + ':00'
        if (s.id) {
          keptIds.add(s.id)
          toUpdate.push({ id: s.id, startTime, stopTime, tokenLimit: s.tokenLimit })
        } else {
          toAdd.push({ dayOfWeek: day.toLowerCase(), startTime, stopTime, tokenLimit: s.tokenLimit })
        }
      })
    })

    const toRemove = [...originalIds].filter(id => !keptIds.has(id))

    setSaveLoading(true)
    setScheduleError('')
    try {
      const res = await updateDoctorSchedule(activeDoctor.id, { toAdd, toUpdate, toRemove, force: false })
      if (res.success) {
        // Re-fetch all 7 days so the grid reflects the latest data
        const getDateForDay = (dayName: string): string => {
          const dayIndex = DAYS.indexOf(dayName)
          const now = new Date()
          const todayIndex = (now.getDay() + 6) % 7
          const diff = dayIndex - todayIndex
          const target = new Date(now)
          target.setDate(now.getDate() + diff)
          return target.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
        }
        const results = await Promise.all(
          DAYS.map(day =>
            getDoctorSchedule(activeDoctor.id, getDateForDay(day), activeContext!.medicalCenter.id)
              .then(r => (r.success ? r.data : []))
              .catch(() => [])
          )
        )
        const all = results.flatMap((daySchedules, i) =>
          daySchedules.map(s => ({ ...s, dayOfWeek: DAYS[i].toLowerCase() }))
        )
        const seen = new Set<string>()
        const unique = all.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true })
        setSchedules(unique)
        setShowModify(false)
      }
    } catch (err: any) {
      const raw: string = err.response?.data?.message || 'Failed to save schedule. Please try again.'
      const formatted = raw.replace(/\b(\d{2}:\d{2}):\d{2}\b/g, (_, hm) => to12Hour(hm))
      setScheduleError(formatted)
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 32, fontFamily: 'Manrope', color: '#636A79', fontSize: 14 }}>Loading schedule...</div>
  }

  return (
    <div className="dp-container">
      <div className="dp-schedule-tab">
        <div className="dp-schedule-tab-header">
          <span className="dp-schedule-tab-title">My Weekly Schedule</span>
          <button className="dp-modify-btn" onClick={openModify}>Modify Schedule</button>
        </div>

        <div className="dp-week-grid">
          {weekSchedule.map(item => (
            <div key={item.day} className="dp-day-card">
              <div className="dp-day-card-header">
                <span className="dp-day-card-name">{item.day}</span>
                <span className={`dp-day-badge${item.sessions.length === 0 ? ' off' : ''}`}>
                  {item.sessions.length === 0 ? 'Off Day' : 'Working Day'}
                </span>
              </div>
              {item.sessions.length > 0 && (
                <div className="dp-day-sessions">
                  {item.sessions.map(s => (
                    <div key={s.id} className="dp-session-card">
                      <span className="dp-session-time">{to12Hour(s.startTime)} – {to12Hour(s.stopTime)}</span>
                      <div className="dp-session-meta">
                        <span>Max {s.tokenLimit} Tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModify && (
        <Modal onClose={() => { setShowModify(false); setScheduleError('') }}>
          <div style={{ width: 520 }}>
            <div className="sch-header">
              <h2 className="sch-title">Modify Schedule</h2>
              <button className="sch-close" onClick={() => { setShowModify(false); setScheduleError('') }}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body">
                {scheduleError && (
                  <div style={{ color: '#F04438', background: '#FEF3F2', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                    {scheduleError}
                  </div>
                )}
                {DAYS.map(day => (
                  <div key={day} className="dp-modify-day-row">
                    <div className="dp-modify-day-left">
                      <button
                        className={`dp-toggle${dayToggles[day] ? ' on' : ''}`}
                        onClick={() => {
                          const turningOn = !dayToggles[day]
                          setDayToggles(p => ({ ...p, [day]: turningOn }))
                          if (turningOn && dayShifts[day]?.length === 0) addShift(day)
                        }}
                      >
                        <span className="dp-toggle-thumb" />
                      </button>
                      <div className="dp-modify-day-name">{day}</div>
                      {dayToggles[day] && (
                        <button className="dp-add-shift-btn" onClick={() => addShift(day)}>+ Add Shift</button>
                      )}
                    </div>
                    {dayToggles[day] && dayShifts[day]?.length > 0 && (
                      <div className="dp-modify-sessions">
                        {dayShifts[day].map((s, si) => (
                          <div key={si} className="dp-modify-session-item">
                            <div className="dp-modify-inputs">
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">Start Time</label>
                                <input type="time" className="dp-modify-input" value={s.startTime} onChange={e => updateShift(day, si, 'startTime', e.target.value)} />
                              </div>
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">End Time</label>
                                <input type="time" className="dp-modify-input" value={s.stopTime} onChange={e => updateShift(day, si, 'stopTime', e.target.value)} />
                              </div>
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">Max Tokens</label>
                                <input type="number" className="dp-modify-input" value={s.tokenLimit} min={1} onChange={e => updateShift(day, si, 'tokenLimit', Number(e.target.value))} />
                              </div>
                              <button className="dp-remove-shift-btn" onClick={() => removeShift(day, si)}>✕</button>
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
              <button className="ip-btn ip-cancel" onClick={() => { setShowModify(false); setScheduleError('') }}>Cancel</button>
              <button className="ip-btn ip-submit" onClick={handleSaveSchedule} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default DoctorSchedulePage
