import type { FC } from 'react'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
import SlidePanel from '../components/SlidePanel'
import { appointments, statusProps as aptStatusProps, bookingProps } from '../data/appointments'
import upDownArrow from '../assets/icons/up-down-arrow.svg'
import exportIcon from '../assets/icons/export-icon.svg'
import importIcon from '../assets/icons/import-icon.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import './Patients.css'

interface Patient {
  id: string
  name: string
  avatar: string
  phone: string
  gender: string
  dob: string
  age: number
  lastVisit: string
  doctor: string
  specialty: string
  status: 'Active' | 'Inactive'
}

const statusProps: Record<Patient['status'], { bgColor: string; textColor: string; dotColor: string }> = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

const patients: Patient[] = [
  { id: 'PAT001', name: 'Katie Sims', avatar: 'https://i.pravatar.cc/32?img=5', phone: '+91 90487 8290', gender: 'Female', dob: 'Jan 12, 1994', age: 32, lastVisit: 'Mar 30, 2026', doctor: 'Dr. Daniel Hamilton', specialty: 'Cardiology', status: 'Active' },
  { id: 'PAT002', name: 'Ricky Smith', avatar: 'https://i.pravatar.cc/32?img=6', phone: '+91 90487 8291', gender: 'Male', dob: 'Mar 5, 1981', age: 45, lastVisit: 'Mar 28, 2026', doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', status: 'Active' },
  { id: 'PAT003', name: 'Autumn Phillips', avatar: 'https://i.pravatar.cc/32?img=7', phone: '+91 90487 8292', gender: 'Female', dob: 'Jul 22, 1998', age: 28, lastVisit: 'Mar 25, 2026', doctor: 'Dr. Michael Chen', specialty: 'Orthopedics', status: 'Inactive' },
  { id: 'PAT004', name: 'Jerry Helfer', avatar: 'https://i.pravatar.cc/32?img=8', phone: '+91 90487 8293', gender: 'Male', dob: 'Sep 3, 1988', age: 38, lastVisit: 'Mar 30, 2026', doctor: 'Dr. Daniel Hamilton', specialty: 'Cardiology', status: 'Active' },
  { id: 'PAT005', name: 'Rodger Struck', avatar: 'https://i.pravatar.cc/32?img=9', phone: '+91 90487 8294', gender: 'Male', dob: 'Feb 14, 1974', age: 52, lastVisit: 'Mar 20, 2026', doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', status: 'Active' },
  { id: 'PAT006', name: 'Bradley Lawlor', avatar: 'https://i.pravatar.cc/32?img=10', phone: '+91 90487 8295', gender: 'Male', dob: 'Nov 30, 1984', age: 41, lastVisit: 'Mar 15, 2026', doctor: 'Dr. Michael Chen', specialty: 'Orthopedics', status: 'Inactive' },
  { id: 'PAT007', name: 'Emily Carter', avatar: 'https://i.pravatar.cc/32?img=11', phone: '+91 90487 8296', gender: 'Female', dob: 'Apr 8, 1990', age: 36, lastVisit: 'Mar 29, 2026', doctor: 'Dr. Emily Carter', specialty: 'Pediatrics', status: 'Active' },
  { id: 'PAT008', name: 'Mark Spencer', avatar: 'https://i.pravatar.cc/32?img=12', phone: '+91 90487 8297', gender: 'Male', dob: 'Jun 17, 1979', age: 47, lastVisit: 'Mar 10, 2026', doctor: 'Dr. Mark Spencer', specialty: 'Neurology', status: 'Active' },
]

const Patients: FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const filtered = patients.filter(p =>
    !searchQuery.trim() ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  )

  return (
    <div className="pat-container">
      <PageHeader title="Patients" />

      <div className="pat-main-card" style={{ marginBottom: 16 }}>
        <div className="pat-toolbar">
          <div className="pat-search">
            <InputBox
              type="text"
              placeholder="Search patient..."
              leftIcon={<img src={searchIcon} alt="" />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              rightIcon={searchQuery ? <span className="pat-search-clear" onClick={() => setSearchQuery('')}>✕</span> : undefined}
            />
          </div>
          <div className="pat-icon-group">
            <button className="pat-icon-btn"><img src={sortIcon} alt="sort" /></button>
            <button className="pat-icon-btn"><img src={upDownArrow} alt="sort order" /></button>
            <button className="pat-icon-btn"><img src={exportIcon} alt="export" /></button>
            <button className="pat-icon-btn"><img src={importIcon} alt="import" /></button>
            <button className="pat-icon-btn"><img src={reloadIcon} alt="reload" /></button>
          </div>
        </div>
      </div>

      <div className="pat-main-card pat-table-card">
        <table className="pat-table">
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '3%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '20%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className="pat-label">PATIENT ID</th>
              <th className="pat-label">PATIENT</th>
              <th className="pat-label">AGE</th>
              <th className="pat-label">GENDER</th>
              <th className="pat-label">DATE OF BIRTH</th>
              <th className="pat-label">LAST VISIT</th>
              <th className="pat-label">STATUS</th>
              <th className="pat-label"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="pat-no-results">No patients found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td className="pat-id">{p.id}</td>
                <td>
                  <div className="pat-patient-cell">
                    <img src={p.avatar} alt={p.name} className="pat-avatar" />
                    <div>
                      <div className="pat-name">{p.name}</div>
                      <div className="pat-phone">{p.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="pat-cell">{p.age}</td>
                <td className="pat-cell">{p.gender}</td>
                <td className="pat-cell">{p.dob}</td>
                <td className="pat-cell">{p.lastVisit}</td>
                <td><Badge text={p.status} {...statusProps[p.status]} /></td>
                <td>
                  <button className="pat-dots-btn" onClick={() => setSelectedPatient(p)}><img src={dotsIcon} alt="more" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <SlidePanel title="Patient Details" onClose={() => setSelectedPatient(null)}>
          <div className="apt-detail-hero">
            <div className="apt-detail-hero-top">
              <img src={selectedPatient.avatar} alt={selectedPatient.name} className="apt-detail-avatar" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="apt-detail-name">{selectedPatient.name}</div>
                  <Badge text={selectedPatient.status} {...statusProps[selectedPatient.status]} />
                </div>
                <div className="apt-detail-id">{selectedPatient.id}</div>
              </div>
            </div>
            <div className="apt-detail-info-row">
              {[
                { label: 'Phone Number', value: selectedPatient.phone },
                { label: 'Gender', value: selectedPatient.gender },
                { label: 'Date of Birth', value: selectedPatient.dob },
                { label: 'Age', value: `${selectedPatient.age} yrs` },
              ].map((item, i, arr) => (
                <div key={item.label} className="apt-detail-info-item">
                  <span className="apt-detail-info-label">{item.label}</span>
                  <span className="apt-detail-info-value">{item.value}</span>
                  {i < arr.length - 1 && <div className="apt-detail-info-divider" />}
                </div>
              ))}
            </div>
          </div>

          <h3 className="apt-section-title">Appointments</h3>
          {(() => {
            const patientApts = appointments.filter(a => a.patient === selectedPatient.name)
            if (patientApts.length === 0) return <p style={{ color: '#A0A5B1', fontSize: 13 }}>No appointments found.</p>
            return patientApts.map(a => (
              <div key={a.id} className="apt-detail-card" style={{ marginBottom: 12 }}>
                <div className="apt-detail-card-row">
                  <Badge text={a.status} {...aptStatusProps[a.status]} />
                </div>
                <div className="apt-detail-card-divider" />
                <div className="apt-detail-card-row apt-detail-doctor-row">
                  <div className="apt-detail-doctor-left">
                    <img src={a.doctorAvatar} alt={a.doctor} className="apt-detail-doc-avatar" />
                    <span className="apt-detail-doc-name">{a.doctor}</span>
                  </div>
                  <div className="apt-detail-card-vdivider" />
                  <span className="apt-detail-doc-specialty">{a.specialty}</span>
                </div>
                <div className="apt-booking-list" style={{ margin: '0 16px 12px' }}>
                  {[
                    { label: 'Appointment ID', value: a.id },
                    { label: 'Date', value: a.date },
                    { label: 'Session', value: a.session },
                    { label: 'Token', value: a.token },
                    { label: 'Booking Method', value: a.bookingMethod },
                  ].map((item, i, arr) => (
                    <div key={item.label}>
                      <div className="apt-booking-item">
                        <span className="apt-booking-label">{item.label}</span>
                        {item.label === 'Booking Method'
                          ? <Badge text={a.bookingMethod} {...bookingProps[a.bookingMethod]} showDot={false} />
                          : <span className="apt-booking-value">{item.value}</span>}
                      </div>
                      {i < arr.length - 1 && <div className="apt-detail-card-divider" />}
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}
        </SlidePanel>
      )}
    </div>
  )
}

export default Patients
