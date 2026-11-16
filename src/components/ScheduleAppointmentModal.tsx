import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import Badge from './Badge'
import { useAppContext } from '../context/AppContext'
import { searchPatients, getDoctors, getDoctorSchedule, createAppointment, createPatient } from '../services/api'
import type { Patient, AppointmentDoctor, DoctorSchedule, CreatedAppointment } from '../services/api'
import calendarIcon from '../assets/icons/calendar.svg'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import userProfileImg from '../assets/images/user-profile.png'
// Modal styles (sch-*, doc-name-*) live with the Appointments page and are shared
import '../pages/Appointments.css'

const to12h = (t: string) => {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

interface ScheduleAppointmentModalProps {
  /** Doctor to pre-select; the user can still change it */
  initialDoctorId?: string
  onClose: () => void
  onCreated?: (appointment: CreatedAppointment) => void
}

const ScheduleAppointmentModal: FC<ScheduleAppointmentModalProps> = ({ initialDoctorId, onClose, onCreated }) => {
  const { activeContext, activeDoctor, specialties: contextSpecialties } = useAppContext()
  const isDoctor = activeContext?.role?.toLowerCase() === 'doctor'
  const specialties = activeContext?.medicalCenter?.specialties?.length
    ? activeContext.medicalCenter.specialties
    : contextSpecialties

  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(isDoctor && activeDoctor ? activeDoctor.id : initialDoctorId ?? '')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString())
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientGender, setPatientGender] = useState('')
  const [patientDob, setPatientDob] = useState('') // kept for backend; not shown in UI
  const [patientAge, setPatientAge] = useState('') // shown in UI; converted to DOB on submit
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [phoneResults, setPhoneResults] = useState<Patient[]>([])
  const [phoneSearchLoading, setPhoneSearchLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const phoneSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phoneInputRef = useRef<HTMLDivElement>(null)
  const nameFieldRef = useRef<HTMLDivElement>(null)
  const ageFieldRef = useRef<HTMLDivElement>(null)

  const [clinicDoctors, setClinicDoctors] = useState<AppointmentDoctor[]>([])
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)

  useEffect(() => {
    // Doctors book only for themselves; the dropdown is hidden for them
    if (isDoctor) return
    getDoctors(activeContext?.medicalCenter.id).then(res => { if (res.success) setClinicDoctors(res.data) }).catch(() => { })
  }, [activeContext?.medicalCenter.id, isDoctor])

  useEffect(() => {
    if (phoneSearchTimer.current) clearTimeout(phoneSearchTimer.current)
    if (!patientPhone.trim()) { setPhoneResults([]); return }
    phoneSearchTimer.current = setTimeout(() => {
      setPhoneSearchLoading(true)
      searchPatients(patientPhone)
        .then(res => { if (res.success) setPhoneResults(res.data) })
        .catch(() => { })
        .finally(() => setPhoneSearchLoading(false))
    }, 350)
    return () => { if (phoneSearchTimer.current) clearTimeout(phoneSearchTimer.current) }
  }, [patientPhone])

  useEffect(() => {
    if (!selectedDoctor || !activeContext) { setDoctorSchedules([]); return }
    const dateStr = new Date(selectedDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    setScheduleLoading(true)
    getDoctorSchedule(selectedDoctor, dateStr, activeContext.medicalCenter.id)
      .then(res => { if (res.success) setDoctorSchedules(res.data) })
      .catch(() => setDoctorSchedules([]))
      .finally(() => setScheduleLoading(false))
  }, [selectedDoctor, selectedDate, activeContext])

  const dateScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dateScrollRef.current) return
    const selected = dateScrollRef.current.querySelector('.sch-date-card.selected') as HTMLElement
    if (selected) selected.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedDate])

  const datePickerRef = useRef<HTMLInputElement>(null)

  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const maxDateStr = (() => { const d = new Date(); d.setDate(d.getDate() + 29); return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) })()

  const doctorMatchesSpecialty = (d: AppointmentDoctor, specialtyId: string) =>
    !specialtyId || d.specialties.some(s => s.id === specialtyId)
  const filteredDoctors = clinicDoctors.filter(d => doctorMatchesSpecialty(d, selectedSpecialty))

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdAppointment, setCreatedAppointment] = useState<CreatedAppointment | null>(null)

  const handleSubmit = async () => {
    if (!selectedSession || !selectedDate || !/^[6-9]\d{9}$/.test(patientPhone.trim()) || !patientName.trim()) return
    setSubmitLoading(true)
    setSubmitError(null)
    try {
      let patientId = selectedPatient?.id
      if (!patientId) {
        // Convert age to a DOB (Jan 1 of the birth year) for the backend
        const dobForBackend = patientAge
          ? `${new Date().getFullYear() - parseInt(patientAge, 10)}-01-01`
          : patientDob
        const pr = await createPatient({ name: patientName, phoneNumber: patientPhone, gender: patientGender, dateOfBirth: dobForBackend })
        if (!pr.success) return
        patientId = pr.data.id
      }
      const res = await createAppointment({
        appointmentDate: new Date(selectedDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
        doctorScheduleId: selectedSession,
        patientId,
      })
      if (res.success) {
        setCreatedAppointment(res.data)
        onCreated?.(res.data)
        setSubmitted(true)
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Something went wrong. Please try again.'
      setSubmitError(message)
    } finally { setSubmitLoading(false) }
  }

  const sessionRanges: Record<string, [number, number]> = {
    '9am-1pm': [9, 13],
    '2pm-4pm': [14, 16],
  }
  const isLive = (() => {
    if (!selectedSession || selectedDate !== new Date().toDateString()) return false
    const [start, end] = sessionRanges[selectedSession] ?? [0, 0]
    const h = new Date().getHours()
    return h >= start && h < end
  })()

  return (
    <Modal onClose={onClose}>
      <div style={{ width: 564 }}>
        {submitted ? (
          <div className="sch-confirm">
            <div className="sch-confirm-token-half">
              {isLive && (
                <span style={{ position: 'absolute', top: 14, left: 14 }}>
                  <Badge text="Live" bgColor="rgba(255,255,255,0.2)" textColor="#fff" dotColor="#fff" />
                </span>
              )}
              <span className="sch-confirm-token-label">Token Number</span>
              <span className="sch-confirm-token-number">{createdAppointment?.tokenNumber ?? '—'}</span>
            </div>
            <div className="sch-confirm-details">
              <div className="sch-confirm-patient">
                <img src={userProfileImg} alt={createdAppointment?.patient.name} className="sch-confirm-avatar" />
                <div>
                  <div className="sch-confirm-name">{createdAppointment?.patient.name ?? '—'}</div>
                  <div className="sch-confirm-phone">+91 {createdAppointment?.patient.phoneNumber ?? '—'}</div>
                </div>
              </div>
              <div className="sch-confirm-info-list">
                {[
                  { label: 'Appointment Date', value: createdAppointment?.appointmentDate ?? '—' },
                  { label: 'Session', value: createdAppointment ? `${to12h(createdAppointment.schedule.startTime)} – ${to12h(createdAppointment.schedule.stopTime)}` : '—' },
                  { label: 'Doctor', value: createdAppointment?.doctor.name ?? '—' },
                  { label: 'Booked Date & Time', value: createdAppointment ? new Date(createdAppointment.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
                ].map((item, i, arr) => (
                  <div key={item.label}>
                    <div className="sch-confirm-info-row">
                      <span className="sch-confirm-info-label">{item.label}</span>
                      <span className="sch-confirm-info-value">{item.value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="sch-confirm-divider" />}
                  </div>
                ))}
              </div>
              <button className="sch-confirm-done" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="sch-header">
              <h2 className="sch-title">Schedule Appointment</h2>
              <button className="sch-close" onClick={onClose}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body" style={{ marginBottom: selectedDoctor ? 32 : 62 }}>
                <h3 className="sch-section-title">Patient Information</h3>
                <div className="sch-form-row">
                  <div className="form-field">
                    <label className="form-field-label">Phone Number<span className="form-field-required"> *</span></label>
                    <div className={`form-field-input-wrap${phoneError ? ' form-field-wrap--error' : ''}`} ref={phoneInputRef}>
                      <span className="form-field-prefix">+91</span>
                      <input
                        className={`form-field-input${phoneError ? ' form-field-input--error' : ''}`}
                        type="tel"
                        placeholder="Enter phone"
                        value={patientPhone}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setPatientPhone(v)
                          setPhoneError('')
                          if (selectedPatient) { setSelectedPatient(null); setPatientName(''); setPatientGender(''); setPatientDob(''); setPatientAge('') }
                        }}
                        onBlur={() => {
                          if (patientPhone && !/^[6-9]\d{9}$/.test(patientPhone)) setPhoneError('Enter a valid 10-digit mobile number')
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); nameFieldRef.current?.querySelector('input')?.focus() } }}
                      />
                      {phoneSearchLoading && <span className="doc-name-search-spinner" />}
                      {selectedPatient && <button className="doc-name-clear-btn" onMouseDown={() => { setSelectedPatient(null); setPatientPhone(''); setPatientName(''); setPatientGender(''); setPatientDob(''); setPatientAge(''); setPhoneResults([]); setPhoneError('') }}>✕</button>}
                    </div>
                    {phoneError && <span className="form-field-error-msg">{phoneError}</span>}
                    {phoneResults.length > 0 && phoneInputRef.current && (() => {
                      const r = phoneInputRef.current!.getBoundingClientRect()
                      return (
                        <ul className="doc-name-dropdown" style={{ top: r.bottom + 4, left: r.left, width: r.width }}>
                          {phoneResults.map(p => (
                            <li key={p.id} className="doc-name-dropdown-item"
                              onMouseDown={() => {
                                setSelectedPatient(p)
                                setPatientPhone(p.phoneNumber)
                                setPatientName(p.name)
                                setPatientGender(p.gender)
                                setPatientDob(p.dateOfBirth)
                                // Compute age from stored DOB for display
                                if (p.dateOfBirth) {
                                  const birthYear = new Date(p.dateOfBirth).getFullYear()
                                  setPatientAge(String(new Date().getFullYear() - birthYear))
                                } else {
                                  setPatientAge('')
                                }
                                setPhoneResults([])
                              }}>
                              <img src={userProfileImg} alt={p.name} className="doc-name-dropdown-avatar" />
                              <div className="doc-name-dropdown-info">
                                <span className="doc-name-dropdown-name">{p.name}</span>
                                <span className="doc-name-dropdown-specialties">{p.phoneNumber}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    })()}
                  </div>
                  <div ref={nameFieldRef}>
                    <FormField label="Name" placeholder="Enter name" value={patientName} readOnly={!!selectedPatient} onChange={e => !selectedPatient && setPatientName((e.target as HTMLInputElement).value)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); ageFieldRef.current?.querySelector('input')?.focus() } }} />
                  </div>
                </div>
                <div className="sch-form-row">
                  <FormField as="select" label="Gender" value={patientGender} options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} disabled={!!selectedPatient} onChange={e => !selectedPatient && setPatientGender((e.target as HTMLSelectElement).value)} />
                  <div ref={ageFieldRef}>
                    <FormField label="Age" placeholder="Enter age" type="number" value={patientAge} readOnly={!!selectedPatient} onChange={e => !selectedPatient && setPatientAge((e.target as HTMLInputElement).value)} />
                  </div>
                </div>
                <h3 className="sch-section-title">Doctor Assign</h3>
                <div className="sch-form-row">
                  {!isDoctor && (
                    <div className="sch-specialty-field">
                      <FormField
                        as="select"
                        label="Specialty"
                        showRequired={false}
                        value={selectedSpecialty}
                        onChange={e => {
                          const specialtyId = (e.target as HTMLSelectElement).value
                          setSelectedSpecialty(specialtyId)
                          // Keep the chosen doctor if they still match the new filter
                          const current = clinicDoctors.find(d => d.id === selectedDoctor)
                          if (!current || !doctorMatchesSpecialty(current, specialtyId)) {
                            setSelectedDoctor('')
                            setSelectedSession(null)
                          }
                        }}
                        options={specialties.map(s => ({ label: s.name, value: s.id }))}
                        selectPlaceholder="All"
                      />
                    </div>
                  )}
                  {!isDoctor && (
                    <FormField
                      as="select"
                      label="Doctor"
                      value={selectedDoctor}
                      onChange={e => { setSelectedDoctor((e.target as HTMLSelectElement).value); setSelectedSession(null) }}
                      options={filteredDoctors.map(d => ({ label: d.name, value: d.id }))}
                      selectPlaceholder={filteredDoctors.length > 0 ? 'Select' : selectedSpecialty ? 'No doctors found for this specialty' : 'No doctors available'}
                      disabled={filteredDoctors.length === 0}
                    />
                  )}
                  {isDoctor && activeDoctor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                      <img src={activeDoctor.profilePicture || doctorProfileImg} alt={activeDoctor.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontFamily: 'Manrope', fontSize: 14, fontWeight: 600, color: '#1A1D1F' }}>{activeDoctor.name}</span>
                    </div>
                  )}
                </div>
                <h3 className="sch-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Select a date
                  <span style={{ cursor: 'pointer', display: 'flex' }} onClick={() => datePickerRef.current?.showPicker()}>
                    <img src={calendarIcon} alt="" style={{ width: 16, height: 16 }} />
                  </span>
                  <input
                    ref={datePickerRef}
                    type="date"
                    min={todayStr}
                    max={maxDateStr}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    onChange={e => {
                      const d = new Date(e.target.value)
                      setSelectedDate(d.toDateString())
                      setSelectedSession(null)
                    }}
                  />
                </h3>
                <div className="sch-date-scroll" ref={dateScrollRef}>
                  {next30Days.map(d => {
                    const key = d.toDateString()
                    const isSelected = selectedDate === key
                    const day = d.toLocaleDateString('en-US', { weekday: 'short' })
                    const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
                    return (
                      <div
                        key={key}
                        className={`sch-date-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => { setSelectedDate(key); setSelectedSession(null) }}
                      >
                        <span className="sch-date-day">{day}</span>
                        <span className="sch-date-val">{dateStr}</span>
                      </div>
                    )
                  })}
                </div>
                {selectedDoctor && (
                  <div className="sch-session-picker">
                    <h3 className="sch-section-title" style={{ marginBottom: 12 }}>Select Session</h3>
                    <div className="sch-session-options">
                      {scheduleLoading
                        ? <span className="doc-name-search-spinner" style={{ margin: '4px 0' }} />
                        : doctorSchedules.length === 0
                          ? <span style={{ fontSize: 13, color: '#9AA0AC', fontFamily: 'Manrope' }}>No sessions available</span>
                          : doctorSchedules.map(s => (
                            <label key={s.id} className={`sch-session-option ${selectedSession === s.id ? 'selected' : ''}`}>
                              <span className={`sch-radio ${selectedSession === s.id ? 'checked' : ''}`} />
                              <input
                                type="radio"
                                name="session"
                                value={s.id}
                                checked={selectedSession === s.id}
                                onChange={() => setSelectedSession(s.id)}
                                style={{ display: 'none' }}
                              />
                              {to12h(s.startTime)} – {to12h(s.stopTime)}
                              {s.remainingTokenCount !== undefined && (
                                <span style={{ marginLeft: 8, fontSize: 11, color: '#636A79' }}>({s.remainingTokenCount} left)</span>
                              )}
                            </label>
                          ))}
                    </div>
                  </div>
                )}
                <div />
              </div>
            </div>
            <div className="sch-divider" />
            {(() => {
              const activeSchedule = doctorSchedules.find(s => s.id === selectedSession)
              const isStaffRole = !isDoctor && activeContext?.role?.toLowerCase() !== 'patient'
              const isExpired = activeSchedule && !isStaffRole ? (() => {
                const [h, m] = activeSchedule.stopTime.split(':').map(Number)
                const stop = new Date(selectedDate); stop.setHours(h, m, 0, 0)
                return new Date() > stop
              })() : false
              const noTokens = activeSchedule && !isStaffRole ? activeSchedule.remainingTokenCount === 0 : false
              const blockReason = isExpired ? 'Session time has passed' : noTokens ? 'No tokens left' : null
              return (
                <>
                  {blockReason && (
                    <div style={{ padding: '8px 24px 0', fontFamily: 'Manrope', fontSize: 12, color: '#F04438' }}>{blockReason}</div>
                  )}
                  {submitError && (
                    <div style={{ padding: '8px 24px 0', fontFamily: 'Manrope', fontSize: 12, color: '#F04438' }}>{submitError}</div>
                  )}
                  <div className="ip-actions" style={{ padding: '16px 24px' }}>
                    <button className="ip-btn ip-cancel" onClick={onClose}>Cancel</button>
                    <button className="ip-btn ip-submit" onClick={handleSubmit} disabled={submitLoading || !/^[6-9]\d{9}$/.test(patientPhone.trim()) || !patientName.trim() || !selectedDoctor || !selectedSession || !!blockReason}>
                      {submitLoading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </>
              )
            })()}
          </>
        )}
      </div>
    </Modal>
  )
}

export default ScheduleAppointmentModal
