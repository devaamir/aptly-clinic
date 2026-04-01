import type { FC } from 'react'
import { useState, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import upDownArrow from '../assets/icons/up-down-arrow.svg'
import Toast from '../components/Toast'
import verifyTickGreen from '../assets/icons/verify-tick-green.svg'
import cameraIcon from '../assets/icons/camera-icon.svg'
import smsIcon from '../assets/icons/sms.svg'
import avatarIcon from '../assets/icons/avatar-icon.svg'
import addIcon from '../assets/icons/add-icon-white.svg'
import './Doctors.css'

interface Doctor {
  id: string
  name: string
  avatar: string
  specialty: string
  phone: string
  email: string
  experience: string
  status: 'Active' | 'Inactive'
}

const doctors: Doctor[] = [
  { id: 'DOC001', name: 'Dr. Daniel Hamilton', avatar: 'https://i.pravatar.cc/48?img=2', specialty: 'Cardiology', phone: '+91 90487 8200', email: 'daniel@aptly.com', experience: '12 yrs', status: 'Active' },
  { id: 'DOC002', name: 'Dr. Sarah Johnson', avatar: 'https://i.pravatar.cc/48?img=1', specialty: 'Cardiology', phone: '+91 90487 8201', email: 'sarah@aptly.com', experience: '9 yrs', status: 'Active' },
  { id: 'DOC003', name: 'Dr. Michael Chen', avatar: 'https://i.pravatar.cc/48?img=4', specialty: 'Orthopedics', phone: '+91 90487 8202', email: 'michael@aptly.com', experience: '15 yrs', status: 'Active' },
  { id: 'DOC004', name: 'Dr. Mark Spencer', avatar: 'https://i.pravatar.cc/48?img=3', specialty: 'Neurology', phone: '+91 90487 8203', email: 'mark@aptly.com', experience: '11 yrs', status: 'Inactive' },
  { id: 'DOC005', name: 'Dr. Emily Carter', avatar: 'https://i.pravatar.cc/48?img=11', specialty: 'Pediatrics', phone: '+91 90487 8204', email: 'emily@aptly.com', experience: '7 yrs', status: 'Active' },
]

const statusProps = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

const Doctors: FC<{ onViewProfile: (d: Doctor) => void }> = ({ onViewProfile }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [doctorAdded, setDoctorAdded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = doctors.filter(d =>
    !searchQuery.trim() ||
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="doc-container">
      <PageHeader title="Doctors" />

      <div className="doc-toolbar-card">
        <div className="doc-search">
          <InputBox
            type="text"
            placeholder="Search doctor..."
            leftIcon={<img src={searchIcon} alt="" />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            rightIcon={searchQuery ? <span className="doc-search-clear" onClick={() => setSearchQuery('')}>✕</span> : undefined}
          />
        </div>
        <div className="doc-actions">
          <button className="doc-icon-btn"><img src={upDownArrow} alt="order" /></button>
          <button className="doc-icon-btn"><img src={sortIcon} alt="sort" /></button>
          <button className="doc-icon-btn"><img src={reloadIcon} alt="reload" /></button>
          <button className="doc-add-btn" onClick={() => setShowAdd(true)}>
            <img src={addIcon} alt="" style={{ width: 16, height: 16 }} />
            Add Doctor
          </button>
        </div>
      </div>

      <div className="doc-main-card doc-table-card">
        <table className="doc-table">
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '20%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className="doc-label">DOCTOR ID</th>
              <th className="doc-label">DOCTOR</th>
              <th className="doc-label">SPECIALTY</th>
              <th className="doc-label">PHONE</th>
              <th className="doc-label">EMAIL</th>
              <th className="doc-label">EXPERIENCE</th>
              <th className="doc-label">STATUS</th>
              <th className="doc-label"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="doc-no-results">No doctors found</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td className="doc-id">{d.id}</td>
                <td>
                  <div className="doc-cell">
                    <img src={d.avatar} alt={d.name} className="doc-avatar" />
                    <span className="doc-name">{d.name}</span>
                  </div>
                </td>
                <td className="doc-text">{d.specialty}</td>
                <td className="doc-text">{d.phone}</td>
                <td className="doc-text">{d.email}</td>
                <td className="doc-text">{d.experience}</td>
                <td>
                  <span className="doc-status-badge" style={{ background: statusProps[d.status].bgColor, color: statusProps[d.status].textColor }}>
                    <span className="doc-status-dot" style={{ background: statusProps[d.status].dotColor }} />
                    {d.status}
                  </span>
                </td>
                <td>
                  <button className="doc-view-btn" onClick={() => onViewProfile(d)}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <div style={{ width: 520 }}>
            {doctorAdded ? (
              <div className="doc-success">
                <div className="doc-success-icon-wrap">
                  <img src={smsIcon} alt="" style={{ width: 34, height: 34 }} />
                </div>
                <h2 className="doc-success-title">Doctor Added Successfully</h2>
                <p className="doc-success-desc">An invitation email has been sent.<br />The doctor must complete account setup by creating a password before accessing the portal.</p>
                <button className="ip-btn ip-submit" style={{ marginTop: 8 }} onClick={() => { setShowAdd(false); setDoctorAdded(false); setAvatarPreview(null); setToast('Doctor added successfully') }}>Done</button>
              </div>
            ) : (
              <>
                <div className="sch-header">
                  <h2 className="sch-title">Add Doctor</h2>
                  <button className="sch-close" onClick={() => setShowAdd(false)}>✕</button>
                </div>
                <div className="sch-divider" />
                <div className="modal-body-scroll">
                  <div className="sch-body">
                    <div className="doc-avatar-upload">
                      <div className="doc-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
                        <img src={avatarPreview ?? avatarIcon} alt="upload" className="doc-avatar-circle" />
                        <div className="doc-camera-btn" onClick={() => fileInputRef.current?.click()}>
                          <img src={cameraIcon} alt="camera" style={{ width: 18, height: 18 }} />
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => { const file = e.target.files?.[0]; if (file) setAvatarPreview(URL.createObjectURL(file)) }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <FormField label="Full Name" placeholder="Enter full name" />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <FormField as="select" label="Specialty" options={[
                        { label: 'Cardiology', value: 'cardiology' },
                        { label: 'Neurology', value: 'neurology' },
                        { label: 'Orthopedics', value: 'orthopedics' },
                        { label: 'Pediatrics', value: 'pediatrics' },
                      ]} />
                    </div>
                    <div className="sch-form-row">
                      <FormField label="Phone Number" placeholder="Enter phone" type="tel" prefix="+91" />
                      <FormField label="Email" placeholder="Enter email" type="email" />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <FormField as="select" label="Gender" options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
                    </div>
                    <div className="sch-form-row">
                      <FormField label="Qualification" placeholder="e.g. MBBS, MD" />
                      <FormField label="Experience (years)" placeholder="e.g. 5" type="number" min={0} />
                    </div>
                    <div className="sch-form-row">
                      <FormField as="select" label="Avg Time / Patient" options={Array.from({length: 12}, (_, i) => ({ label: `${(i+1)*5} min`, value: `${(i+1)*5}` }))} />
                      <FormField label="Consultation Fee" placeholder="e.g. 500" type="number" min={0} />
                    </div>
                    <div className="sch-form-row">
                      <FormField label="License Number" placeholder="Enter license no." />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label className="form-field-label">Biography / About<span className="form-field-required"> *</span></label>
                      <textarea className="doc-textarea" placeholder="Write a short bio..." rows={4} style={{ height: 92 }} />
                    </div>
                  </div>
                </div>
                <div className="sch-divider" />
                <div className="ip-actions" style={{ padding: '16px 24px' }}>
                  <button className="ip-btn ip-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="ip-btn ip-submit" onClick={() => setDoctorAdded(true)}>Add Doctor</button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} icon={<img src={verifyTickGreen} alt="" />} />}
    </div>
  )
}

export default Doctors
