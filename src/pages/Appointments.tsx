import type { FC } from 'react'
import { useState, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
import SlidePanel from '../components/SlidePanel'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import { appointments, bookingProps, statusProps } from '../data/appointments'
import type { Appointment, AptStatus, BookingMethod } from '../data/appointments'
import calendarIcon from '../assets/icons/calendar.svg'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import addIcon from '../assets/icons/add-icon-white.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import './Appointments.css'

type Filter = 'Today' | 'Tomorrow' | 'This Week' | 'Date' | 'Date Range'

const Appointments: FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('Today')
  const [filterDate, setFilterDate] = useState<string | null>(null)
  const [filterRangeStart, setFilterRangeStart] = useState<string | null>(null)
  const [filterRangeEnd, setFilterRangeEnd] = useState<string | null>(null)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString())
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')

  const datePickerRef = useRef<HTMLInputElement>(null)
  const filterDateRef = useRef<HTMLInputElement>(null)
  const filterRangeStartRef = useRef<HTMLInputElement>(null)
  const filterRangeEndRef = useRef<HTMLInputElement>(null)

  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const maxDateStr = (() => { const d = new Date(); d.setDate(d.getDate() + 29); return d.toISOString().split('T')[0] })()

  const doctorsBySpecialty: Record<string, { label: string; value: string }[]> = {
    cardiology: [{ label: 'Dr. Daniel Hamilton', value: 'daniel' }, { label: 'Dr. Sarah Johnson', value: 'sarah' }],
    neurology: [{ label: 'Dr. Mark Spencer', value: 'mark' }],
    orthopedics: [{ label: 'Dr. Michael Chen', value: 'michael' }],
    pediatrics: [{ label: 'Dr. Emily Carter', value: 'emily' }],
  }

  // Doctors with 2 sessions; others get 1 session only
  const doctorSessions: Record<string, { label: string; value: string }[]> = {
    daniel: [{ label: '9:00 AM – 1:00 PM', value: '9am-1pm' }, { label: '2:00 PM – 4:00 PM', value: '2pm-4pm' }],
    sarah: [{ label: '9:00 AM – 1:00 PM', value: '9am-1pm' }, { label: '2:00 PM – 4:00 PM', value: '2pm-4pm' }],
    mark: [{ label: '9:00 AM – 1:00 PM', value: '9am-1pm' }],
    michael: [{ label: '9:00 AM – 1:00 PM', value: '9am-1pm' }],
    emily: [{ label: '9:00 AM – 1:00 PM', value: '9am-1pm' }, { label: '2:00 PM – 4:00 PM', value: '2pm-4pm' }],
  }

  const resetSchedule = () => {
    setShowSchedule(false)
    setSubmitted(false)
    setPatientName('')
    setPatientPhone('')
    setSelectedSpecialty('')
    setSelectedDoctor('')
    setSelectedDate(new Date().toDateString())
    setSelectedSession(null)
  }

  const bookedDateTime = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const tokenNumber = String(appointments.length + 1).padStart(2, '0')

  const allDoctors = Object.values(doctorsBySpecialty).flat()
  const selectedDoctorLabel = allDoctors.find(d => d.value === selectedDoctor)?.label ?? ''

  const filterByDate = (a: Appointment) => {
    const aptDate = new Date(a.date); aptDate.setHours(0,0,0,0)
    const today = new Date(); today.setHours(0,0,0,0)
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 6)
    if (filter === 'Today') return aptDate.toDateString() === today.toDateString()
    if (filter === 'Tomorrow') return aptDate.toDateString() === tomorrow.toDateString()
    if (filter === 'This Week') return aptDate >= today && aptDate <= weekEnd
    if (filter === 'Date' && filterDate) return aptDate.toDateString() === new Date(filterDate).toDateString()
    if (filter === 'Date Range' && filterRangeStart && filterRangeEnd) {
      const s = new Date(filterRangeStart); s.setHours(0,0,0,0)
      const e = new Date(filterRangeEnd); e.setHours(0,0,0,0)
      return aptDate >= s && aptDate <= e
    }
    return true
  }

  const filteredAppointments = appointments.filter(a =>
    filterByDate(a) &&
    (!searchQuery.trim() ||
      a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctor.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
    <div className="apt-container">
      <PageHeader
        title="Appointments"
        actions={
          <button className="apt-schedule-btn" onClick={() => setShowSchedule(true)}>
            <img src={addIcon} alt="" style={{ width: 16, height: 16 }} />
            Schedule Appointment
          </button>
        }
      />

      {/* Toolbar */}
      <div className="apt-main-card" style={{ marginBottom: 16 }}>
        <div className="apt-toolbar">
          <div className="apt-search">
            <InputBox
              type="text"
              placeholder="Search by patient name, doctor..."
              leftIcon={<img src={searchIcon} alt="" />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              rightIcon={searchQuery ? <span className="apt-search-clear" onClick={() => setSearchQuery('')}>✕</span> : undefined}
            />
          </div>
          <div className="apt-filters">
            <div className="apt-filter-group">
              {(['Today', 'Tomorrow', 'This Week', 'Date', 'Date Range'] as Filter[]).map(f => (
                <button
                  key={f}
                  className={`apt-filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => {
                    setFilter(f)
                    if (f === 'Date') filterDateRef.current?.showPicker()
                    if (f === 'Date Range') filterRangeStartRef.current?.showPicker()
                  }}
                >
                  {f === 'Date' && filterDate ? new Date(filterDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : f === 'Date Range' && filterRangeStart && filterRangeEnd ? `${new Date(filterRangeStart).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} – ${new Date(filterRangeEnd).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}` : f}
                </button>
              ))}
              {/* Hidden date pickers */}
              <input ref={filterDateRef} type="date" style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                onChange={e => setFilterDate(e.target.value)} />
              <input ref={filterRangeStartRef} type="date" style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                onChange={e => { setFilterRangeStart(e.target.value); setFilterRangeEnd(null); setTimeout(() => filterRangeEndRef.current?.showPicker(), 100) }} />
              <input ref={filterRangeEndRef} type="date" style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                onChange={e => setFilterRangeEnd(e.target.value)} />
            </div>
            <div className="apt-icon-group">
              <button className="apt-icon-btn"><img src={sortIcon} alt="sort" /></button>
              <button className="apt-icon-btn"><img src={reloadIcon} alt="reload" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="apt-main-card apt-table-card">
        <table className="apt-table">
          <thead>
            <tr>
              <th className='apt-label'>APPOINTMENT ID</th>
              <th className='apt-label'>PATIENT</th>
              <th className='apt-label'>AGE</th>
              <th className='apt-label'>DATE</th>
              <th className='apt-label'>SESSION</th>
              <th className='apt-label'>TOKEN</th>
              <th className='apt-label'>DOCTOR</th>
              <th className='apt-label'>BOOKING METHOD</th>
              <th className='apt-label'>STATUS</th>
              <th className='apt-label'></th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={10} className="apt-no-results">No appointments found</td>
              </tr>
            ) : filteredAppointments.map(a => (
              <tr key={a.id}>
                <td className="apt-id">{a.id}</td>
                <td>
                  <div className="apt-patient-cell">
                    <img src={a.avatar} alt={a.patient} className="patient-avatar" />
                    <div>
                      <div className="apt-patient-name">{a.patient}</div>
                      <div className="apt-patient-phone">{a.phone}</div>
                    </div>
                  </div>
                </td>
                <td className='apt-age'>{a.age}</td>
                <td className='apt-date'>{a.date}</td>
                <td className='apt-session'>{a.session}</td>
                <td><span className="apt-token">{a.token}</span></td>
                <td>
                  <div className="apt-patient-cell">
                    <img src={a.doctorAvatar} alt={a.doctor} className="patient-avatar" />
                    <div>
                      <div className="apt-patient-name">{a.doctor}</div>
                      <div className="apt-patient-phone">{a.specialty}</div>
                    </div>
                  </div>
                </td>
                <td><Badge text={a.bookingMethod} {...bookingProps[a.bookingMethod]} showDot={false} /></td>
                <td><Badge text={a.status} {...statusProps[a.status]} /></td>
                <td>
                  <button className="apt-dots-btn" onClick={() => setSelected(a)}><img src={dotsIcon} alt="more" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <SlidePanel title="Appointment Details" onClose={() => setSelected(null)}>
          <div className="apt-detail-hero">
            <div className="apt-detail-hero-top">
              <img src={selected.avatar} alt={selected.patient} className="apt-detail-avatar" />
              <div>
                <div className="apt-detail-name">{selected.patient}</div>
                <div className="apt-detail-id">{selected.id}</div>
              </div>
            </div>
            <div className="apt-detail-info-row">
              {[
                { label: 'Phone Number', value: selected.phone },
                { label: 'Gender', value: selected.gender },
                { label: 'Date of Birth', value: selected.dob },
                { label: 'Age', value: `${selected.age} yrs` },
              ].map((item, i, arr) => (
                <div key={item.label} className="apt-detail-info-item">
                  <span className="apt-detail-info-label">{item.label}</span>
                  <span className="apt-detail-info-value">{item.value}</span>
                  {i < arr.length - 1 && <div className="apt-detail-info-divider" />}
                </div>
              ))}
            </div>
          </div>

          <h3 className="apt-section-title">Appointment Details</h3>
          <div className="apt-detail-card">
            <div className="apt-detail-card-row">
              <Badge text={selected.status} {...statusProps[selected.status]} />
            </div>
            <div className="apt-detail-card-divider" />
            <div className="apt-detail-card-row apt-detail-doctor-row">
              <div className="apt-detail-doctor-left">
                <img src={selected.doctorAvatar} alt={selected.doctor} className="apt-detail-doc-avatar" />
                <span className="apt-detail-doc-name">{selected.doctor}</span>
              </div>
              <div className="apt-detail-card-vdivider" />
              <span className="apt-detail-doc-specialty">{selected.specialty}</span>
            </div>
            <div className="apt-detail-card-row">
              <div className="apt-token-box">
                <span className="apt-token-label">Token number</span>
                <span className="apt-token-number">{selected.token}</span>
              </div>
            </div>
            <div className="apt-detail-card-row" style={{ justifyContent: 'flex-start' }}>
              <h3 className="apt-section-title" style={{ margin: 0 }}>Booking Information</h3>
            </div>
            <div className="apt-booking-list">
              {[
                { label: 'Appointment Date', value: selected.date },
                { label: 'Session Time', value: selected.session },
                { label: 'Booking Method', value: selected.bookingMethod },
                { label: 'Booked Date', value: selected.bookedDate },
              ].map((item, i, arr) => (
                <div key={item.label}>
                  <div className="apt-booking-item">
                    <span className="apt-booking-label">{item.label}</span>
                    <span className="apt-booking-value">{item.value}</span>
                  </div>
                  {i < arr.length - 1 && <div className="apt-detail-card-divider" />}
                </div>
              ))}
            </div>

            {selected.status === 'Cancelled' && (
              <div className="apt-booking-list">
                {[
                  { label: 'Cancelled By', value: selected.cancelledBy ?? '-' },
                  { label: 'Cancelled On', value: selected.cancelledOn ?? '-' },
                ].map((item, i, arr) => (
                  <div key={item.label}>
                    <div className="apt-booking-item">
                      <span className="apt-booking-label">{item.label}</span>
                      <span className="apt-booking-value">{item.value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="apt-detail-card-divider" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SlidePanel>
      )}

      {showSchedule && (
        <Modal onClose={resetSchedule}>
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
                  <span className="sch-confirm-token-number">{tokenNumber}</span>
                </div>
                <div className="sch-confirm-details">
                  <div className="sch-confirm-patient">
                    <img src="https://i.pravatar.cc/56?img=12" alt={patientName} className="sch-confirm-avatar" />
                    <div>
                      <div className="sch-confirm-name">{patientName || 'Patient'}</div>
                      <div className="sch-confirm-phone">+91 {patientPhone || '—'}</div>
                    </div>
                  </div>
                  <div className="sch-confirm-info-list">
                    {[
                      { label: 'Appointment Date', value: selectedDate },
                      { label: 'Session', value: selectedSession ?? '—' },
                      { label: 'Doctor', value: selectedDoctorLabel },
                      { label: 'Booked Date & Time', value: bookedDateTime },
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
                  <button className="sch-confirm-done" onClick={resetSchedule}>Done</button>
                </div>
              </div>
            ) : (
              <>
                <div className="sch-header">
                  <h2 className="sch-title">Schedule Appointment</h2>
                  <button className="sch-close" onClick={resetSchedule}>✕</button>
                </div>
                <div className="sch-divider" />
                <div className="sch-body" style={{ marginBottom: selectedDoctor ? 32 : 62 }}>
                  <h3 className="sch-section-title">Patient Information</h3>
                  <div className="sch-form-row">
                    <FormField label="Name" placeholder="Enter name" value={patientName} onChange={e => setPatientName((e.target as HTMLInputElement).value)} />
                    <FormField label="Phone Number" placeholder="Enter phone" type="tel" prefix="+91" value={patientPhone} onChange={e => setPatientPhone((e.target as HTMLInputElement).value)} />
                  </div>
                  <div className="sch-form-row">
                    <FormField as="select" label="Gender" options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
                    <FormField label="Date of Birth" placeholder="DD/MM/YYYY" type="date" rightIcon={calendarIcon} />
                  </div>
                  <h3 className="sch-section-title">Doctor Assign</h3>
                  <div className="sch-form-row">
                    <FormField
                      as="select"
                      label="Specialty"
                      value={selectedSpecialty}
                      onChange={e => { setSelectedSpecialty((e.target as HTMLSelectElement).value); setSelectedDoctor(''); setSelectedSession(null) }}
                      options={[
                        { label: 'Cardiology', value: 'cardiology' },
                        { label: 'Neurology', value: 'neurology' },
                        { label: 'Orthopedics', value: 'orthopedics' },
                        { label: 'Pediatrics', value: 'pediatrics' },
                      ]}
                    />
                    <FormField
                      as="select"
                      label="Doctor"
                      value={selectedDoctor}
                      onChange={e => { setSelectedDoctor((e.target as HTMLSelectElement).value); setSelectedSession(null) }}
                      options={selectedSpecialty ? doctorsBySpecialty[selectedSpecialty] : []}
                    />
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
                  <div className="sch-date-scroll">
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
                        {(doctorSessions[selectedDoctor] ?? [{ label: '9:00 AM – 1:00 PM', value: '9am-1pm' }]).map(s => (
                          <label key={s.value} className={`sch-session-option ${selectedSession === s.value ? 'selected' : ''}`}>
                            <span className={`sch-radio ${selectedSession === s.value ? 'checked' : ''}`} />
                            <input
                              type="radio"
                              name="session"
                              value={s.value}
                              checked={selectedSession === s.value}
                              onChange={() => setSelectedSession(s.value)}
                              style={{ display: 'none' }}
                            />
                            {s.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div />
                </div>
                <div className="sch-divider" />
                <div className="ip-actions" style={{ padding: '16px 24px' }}>
                  <button className="ip-btn ip-cancel" onClick={resetSchedule}>Cancel</button>
                  <button className="ip-btn ip-submit" onClick={() => setSubmitted(true)}>Submit</button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Appointments
