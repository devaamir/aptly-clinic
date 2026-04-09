import type { FC } from 'react'
import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
import SlidePanel from '../components/SlidePanel'
import { appointments, statusProps as aptStatusProps, bookingProps } from '../data/appointments'
import { getPatients } from '../services/api'
import type { Patient as ApiPatient } from '../services/types'
import { useAppContext } from '../context/AppContext'
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
  status: 'Active' | 'Inactive'
}

const statusProps: Record<Patient['status'], { bgColor: string; textColor: string; dotColor: string }> = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

const mapPatient = (p: ApiPatient): Patient => ({
  id: p.referenceId,
  name: p.name,
  avatar: `https://i.pravatar.cc/32?u=${p.id}`,
  phone: p.phoneNumber,
  gender: p.gender,
  dob: new Date(p.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  age: new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear(),
  lastVisit: new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  status: p.deletedAt ? 'Inactive' : 'Active',
})

const Patients: FC = () => {
  const { activeContext } = useAppContext()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPatients().then(res => {
      if (res.success) setPatients(res.data.map(mapPatient))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [activeContext?.medicalCenter.id])

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
        {loading ? (
          <div className="pat-loader-wrap">
            <div className="pat-loader" />
          </div>
        ) : (
        <table className="pat-table">
          {filtered.length > 0 && (
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
          )}
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
              <tr><td colSpan={8} className="pat-no-results" style={{ textAlign: 'center' }}>No patients found</td></tr>
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
        )}
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
