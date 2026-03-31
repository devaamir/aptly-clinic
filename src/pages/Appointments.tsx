import type { FC } from 'react'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
import SlidePanel from '../components/SlidePanel'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import calendarIcon from '../assets/icons/calendar.svg'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import addIcon from '../assets/icons/add-icon-white.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import './Appointments.css'

type AptStatus = 'Confirmed' | 'Completed' | 'Cancelled'
type Filter = 'Today' | 'Tomorrow' | 'This Week' | 'Date' | 'Date Range'

interface Appointment {
  id: string
  patient: string
  avatar: string
  phone: string
  gender: string
  dob: string
  age: number
  date: string
  session: string
  token: string
  doctor: string
  doctorAvatar: string
  specialty: string
  bookingMethod: BookingMethod
  bookedDate: string
  cancelledBy?: string
  cancelledOn?: string
  status: AptStatus
}

type BookingMethod = 'Online' | 'Offline'

const bookingProps: Record<BookingMethod, { bgColor: string; textColor: string; dotColor: string }> = {
  Online: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
  Offline: { bgColor: '#FDF2FA', textColor: '#C11574', dotColor: '#EE46BC' },
}

const statusProps: Record<AptStatus, { bgColor: string; textColor: string; dotColor: string }> = {
  Confirmed: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Cancelled: { bgColor: '#FEF3F2', textColor: '#B42318', dotColor: '#F04438' },
  Completed: { bgColor: '#EEF4FF', textColor: '#3538CD', dotColor: '#6172F3' },
}

const appointments: Appointment[] = [
  { id: 'APT001', patient: 'Katie Sims', avatar: 'https://i.pravatar.cc/32?img=5', phone: '+91 90487 8290', gender: 'Female', dob: 'Jan 12, 1994', age: 32, date: 'Mar 30, 2026', session: '09:00 AM', token: '01', doctor: 'Dr. Daniel Hamilton', doctorAvatar: 'https://i.pravatar.cc/32?img=2', specialty: 'Cardiology', bookingMethod: 'Online', status: 'Confirmed' },
  { id: 'APT002', patient: 'Ricky Smith', avatar: 'https://i.pravatar.cc/32?img=6', phone: '+91 90487 8291', gender: 'Male', dob: 'Mar 5, 1981', age: 45, date: 'Mar 30, 2026', session: '09:30 AM', token: '02', doctor: 'Dr. Sarah Johnson', doctorAvatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Confirmed' },
  { id: 'APT003', patient: 'Autumn Phillips', avatar: 'https://i.pravatar.cc/32?img=7', phone: '+91 90487 8292', gender: 'Female', dob: 'Jul 22, 1998', age: 28, date: 'Mar 30, 2026', session: '10:00 AM', token: '03', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Online', status: 'Cancelled', cancelledBy: 'Clinic', cancelledOn: 'Mar 29, 2026' },
  { id: 'APT004', patient: 'Jerry Helfer', avatar: 'https://i.pravatar.cc/32?img=8', phone: '+91 90487 8293', gender: 'Male', dob: 'Sep 3, 1988', age: 38, date: 'Mar 30, 2026', session: '10:30 AM', token: '04', doctor: 'Dr. Daniel Hamilton', doctorAvatar: 'https://i.pravatar.cc/32?img=2', specialty: 'Cardiology', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Completed' },
  { id: 'APT005', patient: 'Rodger Struck', avatar: 'https://i.pravatar.cc/32?img=9', phone: '+91 90487 8294', gender: 'Male', dob: 'Feb 14, 1974', age: 52, date: 'Mar 30, 2026', session: '11:00 AM', token: '05', doctor: 'Dr. Sarah Johnson', doctorAvatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', bookingMethod: 'Online', status: 'Confirmed' },
  { id: 'APT006', patient: 'Bradley Lawlor', avatar: 'https://i.pravatar.cc/32?img=10', phone: '+91 90487 8295', gender: 'Male', dob: 'Nov 30, 1984', age: 41, date: 'Mar 30, 2026', session: '11:30 AM', token: '06', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Confirmed' },
  { id: 'APT007', patient: 'Bradley Lawlor', avatar: 'https://i.pravatar.cc/32?img=10', phone: '+91 90487 8295', gender: 'Male', dob: 'Nov 30, 1984', age: 41, date: 'Mar 30, 2026', session: '11:30 AM', token: '06', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Confirmed' },
  { id: 'APT008', patient: 'Bradley Lawlor', avatar: 'https://i.pravatar.cc/32?img=10', phone: '+91 90487 8295', gender: 'Male', dob: 'Nov 30, 1984', age: 41, date: 'Mar 30, 2026', session: '11:30 AM', token: '06', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Confirmed' },
]

const Appointments: FC = () => {
  const [filter, setFilter] = useState<Filter>('Today')
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

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
            <InputBox type="text" placeholder="Search by patient name, doctor..." leftIcon={<img src={searchIcon} alt="" />} />
          </div>
          <div className="apt-filters">
            <div className="apt-filter-group">
              {(['Today', 'Tomorrow', 'This Week', 'Date', 'Date Range'] as Filter[]).map(f => (
                <button key={f} className={`apt-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
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
            {appointments.map(a => (
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
        <Modal onClose={() => setShowSchedule(false)}>
          <div style={{ width: 564 }}>
            <div className="sch-header">
              <h2 className="sch-title">Schedule Appointment</h2>
              <button className="sch-close" onClick={() => setShowSchedule(false)}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="sch-body">
              <h3 className="sch-section-title">Patient Information</h3>
              <div className="sch-form-row">
                <FormField label="Name" placeholder="Enter name" />
                <FormField label="Phone Number" placeholder="Enter phone" type="tel" prefix="+91" />
              </div>
              <div className="sch-form-row">
                <FormField as="select" label="Gender" options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
                <FormField label="Date of Birth" placeholder="DD/MM/YYYY" type="date" rightIcon={calendarIcon} />
              </div>
              <h3 className="sch-section-title">Doctor Assign</h3>
              <div className="sch-form-row">
                <FormField as="select" label="Specialty" options={[{ label: 'Pediatrics', value: 'pediatrics' }, { label: 'Cardiology', value: 'cardiology' }, { label: 'Neurology', value: 'neurology' }, { label: 'Orthopedics', value: 'orthopedics' }]} />
                <FormField as="select" label="Doctors" options={[{ label: 'Dr. John Doe', value: 'john' }, { label: 'Dr. Jane Smith', value: 'jane' }]} />
              </div>
            </div>


          </div>
        </Modal>
      )}
    </div>
  )
}

export default Appointments
