import type { FC, ChangeEvent } from 'react'
import { useState } from 'react'
import avatarIcon from '../assets/icons/avatar-icon.svg'
import cameraIcon from '../assets/icons/camera-icon.svg'
import './Settings.css'

type SettingsTab = 'Clinic Profile' | 'Consulting Rooms' | 'Notifications' | 'Security' | 'Billing' | 'Integrations'
const tabs: SettingsTab[] = ['Clinic Profile', 'Consulting Rooms', 'Notifications', 'Security', 'Billing', 'Integrations']

const InfoRow: FC<{ label: string; value: string; editing?: boolean; onChange?: (v: string) => void; multiline?: boolean }> = ({ label, value, editing, onChange, multiline }) => (
  <div className="st-info-row">
    <span className="st-info-label">{label}</span>
    {editing
      ? multiline
        ? <textarea className="st-edit-input st-edit-textarea" value={value} onChange={e => onChange?.(e.target.value)} />
        : <input className="st-edit-input" value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)} />
      : <span className="st-info-value">{value}</span>
    }
  </div>
)

const Settings: FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Clinic Profile')
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Aptly Clinic', practice: 'Multi-Specialty', phone: '+91 90487 8200',
    email: 'contact@aptlyclinic.com', website: 'www.aptlyclinic.com',
    specialties: ['Cardiology', 'Orthopedics', 'Neurology'],
    about: 'Aptly Clinic is a leading multi-specialty healthcare provider committed to delivering quality care.',
    address: '123, MG Road, Bengaluru, Karnataka - 560001',
    lat: '12.9716° N', lng: '77.5946° E',
    ownerName: 'Dr. Rajesh Kumar', ownerPhone: '+91 98765 43210', ownerEmail: 'owner@aptlyclinic.com',
  })
  const [draft, setDraft] = useState(profile)

  const allSpecialties = ['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'Dermatology', 'Gynecology', 'ENT', 'Ophthalmology']

  const set = (key: keyof typeof profile) => (v: string) => setDraft(p => ({ ...p, [key]: v }))

  const handleEdit = () => { setDraft(profile); setEditing(true) }
  const handleSave = () => { setProfile(draft); setEditing(false) }
  const handleCancel = () => setEditing(false)

  return (
    <div className="st-container">
      <div className="st-header">
        <h1 className="st-title">Settings</h1>
        <p className="st-subtitle">Manage your clinic profile, consulting rooms, and system preferences</p>
      </div>

      <div className="st-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`st-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="st-content">
        {activeTab === 'Clinic Profile' && (
          <div className="st-card">
            <div className="st-card-header">
              <span className="st-card-title">Clinic Profile</span>
              {editing ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="st-cancel-btn" onClick={handleCancel}>Cancel</button>
                  <button className="st-edit-btn" onClick={handleSave}>Save Changes</button>
                </div>
              ) : (
                <button className="st-edit-btn" onClick={handleEdit}>Edit Profile</button>
              )}
            </div>
            <div className="st-card-divider" />

            <div className="st-section">
              <div className="st-section-title">Basic Information</div>
              <div className="st-profile-row">
                <div className="st-avatar-wrap">
                  <img src={avatarIcon} alt="clinic" className="st-avatar" />
                  <div className="st-camera-btn">
                    <img src={cameraIcon} alt="" style={{ width: 16, height: 16 }} />
                  </div>
                </div>
                <div className="st-info-grid">
                  <InfoRow label="Clinic Name" value={draft.name} editing={editing} onChange={set('name')} />
                  <InfoRow label="Practice Type" value={draft.practice} editing={editing} onChange={set('practice')} />
                  <InfoRow label="Phone Number" value={draft.phone} editing={editing} onChange={set('phone')} />
                  <InfoRow label="Email" value={draft.email} editing={editing} onChange={set('email')} />
                  <InfoRow label="Website" value={draft.website} editing={editing} onChange={set('website')} />
                  <div className="st-info-row">
                    <span className="st-info-label">Specialty</span>
                    {editing ? (
                      <div className="st-specialty-wrap">
                        <div className="st-specialty-tags">
                          {draft.specialties.map(s => (
                            <span key={s} className="st-specialty-tag">
                              {s}
                              <button className="st-tag-remove" onClick={() => setDraft(p => ({ ...p, specialties: p.specialties.filter(x => x !== s) }))}>✕</button>
                            </span>
                          ))}
                        </div>
                        <select className="st-edit-input" value="" onChange={e => { const v = e.target.value; if (v && !draft.specialties.includes(v)) setDraft(p => ({ ...p, specialties: [...p.specialties, v] })) }}>
                          <option value="">+ Add specialty</option>
                          {allSpecialties.filter(s => !draft.specialties.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ) : (
                      <span className="st-info-value">{draft.specialties.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>
              <InfoRow label="About Clinic" value={draft.about} editing={editing} onChange={set('about')} multiline />
              <InfoRow label="Address" value={draft.address} editing={editing} onChange={set('address')} />
              <div className="st-info-grid">
                <InfoRow label="Latitude" value={draft.lat} editing={editing} onChange={set('lat')} />
                <InfoRow label="Longitude" value={draft.lng} editing={editing} onChange={set('lng')} />
              </div>
            </div>

            <div className="st-card-divider" />

            <div className="st-section">
              <div className="st-section-title">Owner Details</div>
              <div className="st-info-grid">
                <InfoRow label="Owner Name" value={draft.ownerName} editing={editing} onChange={set('ownerName')} />
                <InfoRow label="Phone Number" value={draft.ownerPhone} editing={editing} onChange={set('ownerPhone')} />
                <InfoRow label="Email" value={draft.ownerEmail} editing={editing} onChange={set('ownerEmail')} />
              </div>
            </div>
          </div>
        )}
        {activeTab !== 'Clinic Profile' && (
          <div className="st-placeholder">{activeTab} settings coming soon.</div>
        )}
      </div>
    </div>
  )
}

export default Settings
