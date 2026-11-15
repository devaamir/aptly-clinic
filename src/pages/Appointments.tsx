import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
import SlidePanel from '../components/SlidePanel'
import Modal from '../components/Modal'
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal'
import { bookingProps, statusProps } from '../data/appointments'
import type { Appointment, AptStatus, BookingMethod } from '../data/appointments'
import { useAppContext } from '../context/AppContext'
import { getAppointments, updateAppointmentStatus } from '../services/api'
import type { Appointment as ApiAppointment } from '../services/api'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import addIcon from '../assets/icons/add-icon-white.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import './Appointments.css'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import userProfileImg from '../assets/images/user-profile.png'
import folderIcon from '../assets/images/folder-icon.png'

const to12h = (t: string) => {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const mapApiAppointment = (a: ApiAppointment): Appointment => ({
  id: a.referenceId,
  uuid: a.id,
  patient: a.patient?.name ?? '',
  avatar: userProfileImg,
  phone: a.patient?.phoneNumber ?? '',
  gender: a.patient?.gender ?? '',
  dob: a.patient?.dateOfBirth ?? '',
  age: a.patient?.dateOfBirth ? new Date().getFullYear() - new Date(a.patient.dateOfBirth).getFullYear() : 0,
  date: new Date(a.appointmentDate + 'T00:00:00+05:30').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  rawDate: new Date(a.appointmentDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
  session: a.schedule ? `${to12h(a.schedule.startTime)} – ${to12h(a.schedule.stopTime)}` : '',
  token: String(a.tokenNumber).padStart(2, '0'),
  doctor: a.doctor?.name ?? '',
  doctorAvatar: a.doctor?.profilePicture || doctorProfileImg,
  specialty: a.doctor?.specialties?.[0]?.name ?? '',
  bookingMethod: a.creatorRole === 'patient' ? 'Online' : 'Offline' as BookingMethod,
  bookedDate: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  status: (a.tokenStatus === 'cancelled' ? 'Cancelled' : 'Confirmed') as AptStatus,
})

type Filter = 'Today' | 'Tomorrow' | 'This Week' | 'Date' | 'Date Range'

const Appointments: FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { activeContext } = useAppContext()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ totalPages: number; totalItems: number; hasNextPage: boolean } | null>(null)
  const [filter, setFilter] = useState<Filter>('Today')
  const [filterDate, setFilterDate] = useState<string | null>(null)
  const [filterRangeStart, setFilterRangeStart] = useState<string | null>(null)
  const [filterRangeEnd, setFilterRangeEnd] = useState<string | null>(null)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const fetchAppointments = (p = page) => {
    setLoading(true)
    getAppointments(p).then(res => {
      console.log('getAppointments res', res)
      if (res.success) {
        setAppointments(res.data.map(mapApiAppointment))
        setPagination(res.pagination ? {
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          hasNextPage: res.pagination.hasNextPage,
        } : null)
      }
    }).catch(e => console.log('getAppointments error', e)).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAppointments(page)
  }, [activeContext?.medicalCenter.id, page])

  const filterDateRef = useRef<HTMLInputElement>(null)
  const filterRangeStartRef = useRef<HTMLInputElement>(null)
  const filterRangeEndRef = useRef<HTMLInputElement>(null)

  const [cancelLoading, setCancelLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const handleCancel = async () => {
    if (!selected?.uuid) return
    setCancelLoading(true)
    try {
      const res = await updateAppointmentStatus(selected.uuid, 'cancelled')
      if (res.success) {
        setAppointments(prev => prev.map(a => a.uuid === selected.uuid ? { ...a, status: 'Cancelled' as const } : a))
        setSelected(prev => prev ? { ...prev, status: 'Cancelled' as const } : prev)
      }
    } catch { /* silent */ } finally { setCancelLoading(false) }
  }
  const filterByDate = (a: Appointment) => {
    const aptDate = a.rawDate  // YYYY-MM-DD in IST
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const weekEnd = new Date(Date.now() + 6 * 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    if (filter === 'Today') return aptDate === today
    if (filter === 'Tomorrow') return aptDate === tomorrow
    if (filter === 'This Week') return aptDate >= today && aptDate <= weekEnd
    if (filter === 'Date' && filterDate) return aptDate === filterDate
    if (filter === 'Date Range' && filterRangeStart && filterRangeEnd) return aptDate >= filterRangeStart && aptDate <= filterRangeEnd
    return true
  }

  const filteredAppointments = appointments.filter(a =>
    filterByDate(a) &&
    (!searchQuery.trim() ||
      a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctor.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  console.log('appointments raw', appointments.map(a => ({ rawDate: a.rawDate, date: a.date })))
  console.log('today IST', new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }))
  console.log('filteredAppointments', filteredAppointments);


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
              {/* <button className="apt-icon-btn"><img src={sortIcon} alt="sort" /></button> */}
              <button className="apt-icon-btn" onClick={() => { setPage(1); fetchAppointments(1) }}><img src={reloadIcon} alt="reload" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="apt-main-card apt-table-card">
        <div className="apt-table-scroll">
        {loading ? (
          <div className="apt-loader-wrap"><div className="apt-loader" /></div>
        ) : (
          <>
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
                  <td colSpan={10} className="apt-no-results">
                    <div className="apt-empty-state">
                      <img src={folderIcon} alt="No appointments" className="apt-empty-icon" />
                      <span className="apt-empty-title">No Records Found</span>
                      <span className="apt-empty-sub">We couldn't find anything matching your criteria. Try changing your filters or add something new.</span>
                    </div>
                  </td>
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
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && filteredAppointments.length > 0 && (
            <div className="apt-pagination">
              <span className="apt-pagination-info">
                Page {page} of {pagination.totalPages} · {pagination.totalItems} total
              </span>
              <div className="apt-pagination-controls">
                <button className="apt-page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                <button className="apt-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={`ellipsis-${i}`} className="apt-page-ellipsis">…</span>
                      : <button key={p} className={`apt-page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p as number)}>{p}</button>
                  )}
                <button className="apt-page-btn" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNextPage}>Next ›</button>
                <button className="apt-page-btn" onClick={() => setPage(pagination.totalPages)} disabled={page === pagination.totalPages}>»</button>
              </div>
            </div>
          )}
          </>
        )}
        </div>
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
          {selected.status !== 'Cancelled' && (
            <div style={{ padding: '16px 0 0' }}>
              <button className="ip-btn ip-submit" style={{ width: '100%', background: '#F04438' }} onClick={() => setShowCancelConfirm(true)}>
                Cancel Appointment
              </button>
            </div>
          )}
        </SlidePanel>
      )}

      {showCancelConfirm && (
        <Modal onClose={() => setShowCancelConfirm(false)}>
          <div style={{ width: 380, padding: 24, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Manrope' }}>Cancel Appointment</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#636A79', fontFamily: 'Manrope' }}>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => setShowCancelConfirm(false)} disabled={cancelLoading}>Keep</button>
              <button className="ip-btn ip-submit" style={{ flex: 1, background: '#F04438' }} onClick={async () => { await handleCancel(); setShowCancelConfirm(false) }} disabled={cancelLoading}>
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showSchedule && (
        <ScheduleAppointmentModal
          onClose={() => setShowSchedule(false)}
          onCreated={created => setAppointments(prev => [mapApiAppointment(created as unknown as ApiAppointment), ...prev])}
        />
      )}
    </div>
  )
}

export default Appointments
