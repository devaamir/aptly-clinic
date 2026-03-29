import type { FC } from 'react'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
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
  age: number
  date: string
  session: string
  token: string
  doctor: string
  doctorAvatar: string
  specialty: string
  bookingMethod: BookingMethod
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
  { id: 'APT001', patient: 'Katie Sims', avatar: 'https://i.pravatar.cc/32?img=5', phone: '+91 90487 8290', age: 32, date: 'Mar 30, 2026', session: '09:00 AM', token: '01', doctor: 'Dr. Daniel Hamilton', doctorAvatar: 'https://i.pravatar.cc/32?img=2', specialty: 'Cardiology', bookingMethod: 'Online', status: 'Confirmed' },
  { id: 'APT002', patient: 'Ricky Smith', avatar: 'https://i.pravatar.cc/32?img=6', phone: '+91 90487 8291', age: 45, date: 'Mar 30, 2026', session: '09:30 AM', token: '02', doctor: 'Dr. Sarah Johnson', doctorAvatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', bookingMethod: 'Offline', status: 'Confirmed' },
  { id: 'APT003', patient: 'Autumn Phillips', avatar: 'https://i.pravatar.cc/32?img=7', phone: '+91 90487 8292', age: 28, date: 'Mar 30, 2026', session: '10:00 AM', token: '03', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Online', status: 'Cancelled' },
  { id: 'APT004', patient: 'Jerry Helfer', avatar: 'https://i.pravatar.cc/32?img=8', phone: '+91 90487 8293', age: 38, date: 'Mar 30, 2026', session: '10:30 AM', token: '04', doctor: 'Dr. Daniel Hamilton', doctorAvatar: 'https://i.pravatar.cc/32?img=2', specialty: 'Cardiology', bookingMethod: 'Offline', status: 'Completed' },
  { id: 'APT005', patient: 'Rodger Struck', avatar: 'https://i.pravatar.cc/32?img=9', phone: '+91 90487 8294', age: 52, date: 'Mar 30, 2026', session: '11:00 AM', token: '05', doctor: 'Dr. Sarah Johnson', doctorAvatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', bookingMethod: 'Online', status: 'Confirmed' },
  { id: 'APT006', patient: 'Bradley Lawlor', avatar: 'https://i.pravatar.cc/32?img=10', phone: '+91 90487 8295', age: 41, date: 'Mar 30, 2026', session: '11:30 AM', token: '06', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Offline', status: 'Confirmed' },
]

const Appointments: FC = () => {
  const [filter, setFilter] = useState<Filter>('Today')

  return (
    <div className="apt-container">
      <PageHeader
        title="Appointments"
        actions={
          <button className="apt-schedule-btn">
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
              <th>APPOINTMENT ID</th>
              <th>PATIENT</th>
              <th>AGE</th>
              <th>DATE</th>
              <th>SESSION</th>
              <th>TOKEN</th>
              <th>DOCTOR</th>
              <th>BOOKING METHOD</th>
              <th>STATUS</th>
              <th></th>
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
                <td>{a.age}</td>
                <td>{a.date}</td>
                <td>{a.session}</td>
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
                  <button className="apt-dots-btn"><img src={dotsIcon} alt="more" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Appointments
