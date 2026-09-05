import type { FC, ChangeEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import avatarIcon from '../assets/icons/avatar-icon.svg'
import cameraIcon from '../assets/icons/camera-icon.svg'
import { updateDoctor } from '../services/api'
import { useAppContext } from '../context/AppContext'
import './Settings.css'
import './Doctors.css'

type SettingsTab = 'Doctor Profile' | 'Notifications' | 'Security'
const tabs: SettingsTab[] = ['Doctor Profile', 'Notifications', 'Security']

const InfoRow: FC<{
  label: string
  value: string
  editing?: boolean
  onChange?: (v: string) => void
  multiline?: boolean
  error?: string
  type?: string
  placeholder?: string
  prefix?: string
  digitsOnly?: boolean
}> = ({ label, value, editing, onChange, multiline, error, type = 'text', placeholder, prefix, digitsOnly }) => (
  <div className="st-info-row">
    <span className="st-info-label">{label}</span>
    {editing ? (
      multiline ? (
        <textarea className="st-edit-input st-edit-textarea" value={value} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className={prefix ? 'st-phone-wrap' : undefined}>
            {prefix && <span className="st-phone-prefix">{prefix}</span>}
            <input
              className={`st-edit-input${prefix ? ' st-phone-input' : ''}${error ? ' st-edit-input--error' : ''}`}
              type={type}
              value={value}
              placeholder={placeholder}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const v = digitsOnly ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
                onChange?.(v)
              }}
              inputMode={digitsOnly ? 'numeric' : undefined}
              maxLength={digitsOnly ? 10 : undefined}
            />
          </div>
          {error && <span style={{ fontSize: 12, color: '#E53E3E', fontFamily: 'Manrope' }}>{error}</span>}
        </div>
      )
    ) : (
      <span className="st-info-value">{value ? (prefix ? `${prefix} ${value}` : value) : '—'}</span>
    )}
  </div>
)

const DoctorSettings: FC = () => {
  const { activeDoctor, setActiveDoctor, specialties: contextSpecialties, medicalSystems, qualifications } = useAppContext()
  const [activeTab, setActiveTab] = useState<SettingsTab>('Doctor Profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarFileRef = useRef<File | null>(null)

  const emptyProfile = {
    name: '',
    email: '',
    phone: '',
    about: '',
    consultationFee: '',
    yearsOfExperience: '',
    estimateConsultationTime: '',
    advanceBookingLimit: '',
    medicalSystemId: '',
    medicalSystemName: '',
    specialtyIds: [] as string[],
    qualificationIds: [] as string[],
    avatar: '',
  }

  const [profile, setProfile] = useState(emptyProfile)
  const [draft, setDraft] = useState(emptyProfile)
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [qualificationSearch, setQualificationSearch] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!activeDoctor) return
    const p = {
      name: activeDoctor.name ?? '',
      email: activeDoctor.emailAddress ?? '',
      phone: activeDoctor.phoneNumber ?? '',
      about: (activeDoctor as any).about ?? '',
      consultationFee: (activeDoctor as any).consultationFee != null ? String((activeDoctor as any).consultationFee) : '',
      yearsOfExperience: (activeDoctor as any).yearsOfExperience != null ? String((activeDoctor as any).yearsOfExperience) : '',
      estimateConsultationTime: (activeDoctor as any).estimateConsultationTime != null ? String((activeDoctor as any).estimateConsultationTime) : '',
      advanceBookingLimit: (activeDoctor as any).advanceBookingLimit != null ? String((activeDoctor as any).advanceBookingLimit) : '',
      medicalSystemId: (activeDoctor as any).medicalSystem?.id ?? '',
      medicalSystemName: (activeDoctor as any).medicalSystem?.name ?? '',
      specialtyIds: (activeDoctor as any).specialties?.map((s: any) => s.id) ?? [],
      qualificationIds: (activeDoctor as any).qualifications?.map((q: any) => q.id) ?? [],
      avatar: activeDoctor.profilePicture ?? '',
    }
    setProfile(p)
    setDraft(p)
  }, [activeDoctor])

  const set = (key: keyof typeof profile) => (v: string) => {
    setDraft(p => ({ ...p, [key]: v }))
    setFieldErrors(p => ({ ...p, [key]: '' }))
  }

  const handleEdit = () => {
    setDraft(profile)
    setEditing(true)
    setFieldErrors({})
    setSaveError('')
    avatarFileRef.current = null
  }

  const handleCancel = () => {
    setDraft(profile)
    setEditing(false)
    setSaveError('')
    setFieldErrors({})
    avatarFileRef.current = null
  }

  const handleSave = async () => {
    if (!activeDoctor) return
    setSaving(true)
    setSaveError('')
    try {
      const body: any = avatarFileRef.current
        ? (() => {
            const fd = new FormData()
            if (draft.name) fd.append('name', draft.name)
            if (draft.email) fd.append('emailAddress', draft.email)
            if (draft.about) fd.append('about', draft.about)
            if (draft.consultationFee) fd.append('consultationFee', draft.consultationFee)
            if (draft.yearsOfExperience) fd.append('yearsOfExperience', draft.yearsOfExperience)
            if (draft.estimateConsultationTime) fd.append('estimateConsultationTime', draft.estimateConsultationTime)
            if (draft.advanceBookingLimit) fd.append('advanceBookingLimit', draft.advanceBookingLimit)
            if (draft.medicalSystemId) fd.append('medicalSystemId', draft.medicalSystemId)
            draft.specialtyIds.forEach(id => fd.append('specialtyIds', id))
            draft.qualificationIds.forEach(id => fd.append('qualificationIds', id))
            fd.append('profilePicture', avatarFileRef.current!)
            return fd
          })()
        : {
            name: draft.name || undefined,
            emailAddress: draft.email || undefined,
            about: draft.about || undefined,
            consultationFee: draft.consultationFee ? Number(draft.consultationFee) : undefined,
            yearsOfExperience: draft.yearsOfExperience ? Number(draft.yearsOfExperience) : undefined,
            estimateConsultationTime: draft.estimateConsultationTime ? Number(draft.estimateConsultationTime) : undefined,
            advanceBookingLimit: draft.advanceBookingLimit ? Number(draft.advanceBookingLimit) : undefined,
            medicalSystemId: draft.medicalSystemId || undefined,
            specialtyIds: draft.specialtyIds,
            qualificationIds: draft.qualificationIds,
          }

      const res = await updateDoctor(activeDoctor.id, body)
      if (res.success) {
        const newAvatar = (res.data as any)?.profilePicture ?? draft.avatar
        const newProfile = { ...draft, avatar: newAvatar }
        setProfile(newProfile)
        setDraft(newProfile)
        // update context
        setActiveDoctor({ ...activeDoctor, ...res.data, profilePicture: newAvatar } as any)
        setEditing(false)
        avatarFileRef.current = null
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="st-container">
      <div className="st-header">
        <h1 className="st-title">Settings</h1>
        <p className="st-subtitle">Manage your profile and preferences</p>
      </div>

      <div className="st-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`st-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="st-content">
        {activeTab === 'Doctor Profile' && (
          <div className="st-card">
            <div className="st-card-header">
              <span className="st-card-title">Doctor Profile</span>
              {editing ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {saveError && <span style={{ fontSize: 13, color: '#E53E3E' }}>{saveError}</span>}
                  <button className="st-cancel-btn" onClick={handleCancel}>Cancel</button>
                  <button className="st-edit-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button className="st-edit-btn" onClick={handleEdit}>Edit Profile</button>
              )}
            </div>
            <div className="st-card-divider" />

            <div className="st-section">
              <div className="st-section-title">Basic Information</div>
              <div className="st-profile-row">
                {/* Avatar */}
                <div className="st-avatar-wrap">
                  <img
                    src={draft.avatar || avatarIcon}
                    alt="doctor"
                    className="st-avatar"
                    style={{ cursor: 'pointer' }}
                    onClick={() => editing ? fileInputRef.current?.click() : setShowAvatarModal(true)}
                  />
                  {editing && (
                    <div className="st-camera-btn" onClick={() => fileInputRef.current?.click()}>
                      <img src={cameraIcon} alt="" style={{ width: 16, height: 16 }} />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        avatarFileRef.current = file
                        setDraft(p => ({ ...p, avatar: URL.createObjectURL(file) }))
                      }
                      e.target.value = ''
                    }}
                  />
                </div>

                {showAvatarModal && (
                  <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={() => setShowAvatarModal(false)}
                  >
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setShowAvatarModal(false)}
                        style={{ position: 'absolute', top: -16, right: -16, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0A0A0A', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                      >✕</button>
                      <img src={draft.avatar || avatarIcon} alt="doctor" style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 12, display: 'block', objectFit: 'contain' }} />
                    </div>
                  </div>
                )}

                <div className="st-info-grid">
                  <InfoRow label="Full Name" value={draft.name} editing={editing} onChange={set('name')} placeholder="Enter full name" />
                  <InfoRow label="Phone Number" value={draft.phone} editing={editing} onChange={set('phone')} digitsOnly prefix="+91" error={fieldErrors.phone} placeholder="98765 43210" />
                  <InfoRow label="Email" value={draft.email} editing={editing} onChange={set('email')} placeholder="doctor@example.com" error={fieldErrors.email} />
                  <InfoRow label="Consultation Fee (₹)" value={draft.consultationFee} editing={editing} onChange={set('consultationFee')} type="number" placeholder="e.g. 500" />
                  <InfoRow label="Experience (years)" value={draft.yearsOfExperience} editing={editing} onChange={set('yearsOfExperience')} type="number" placeholder="e.g. 5" />
                  <InfoRow label="Avg Time / Patient (min)" value={draft.estimateConsultationTime} editing={editing} onChange={set('estimateConsultationTime')} type="number" placeholder="e.g. 15" />
                  <InfoRow label="Advance Booking Limit (days)" value={draft.advanceBookingLimit} editing={editing} onChange={set('advanceBookingLimit')} type="number" placeholder="e.g. 7" />

                  {/* Medical System */}
                  <div className="st-info-row">
                    <span className="st-info-label">Medical System</span>
                    {editing ? (
                      <select
                        className="st-edit-input"
                        value={draft.medicalSystemId}
                        onChange={e => {
                          const selected = medicalSystems.find(m => m.id === e.target.value)
                          setDraft(p => ({ ...p, medicalSystemId: e.target.value, medicalSystemName: selected?.name ?? '' }))
                        }}
                      >
                        <option value="">Select medical system</option>
                        {medicalSystems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    ) : (
                      <span className="st-info-value">{draft.medicalSystemName || '—'}</span>
                    )}
                  </div>
                </div>
              </div>

              <InfoRow label="About" value={draft.about} editing={editing} onChange={set('about')} multiline placeholder="Brief bio about yourself" />
            </div>

            <div className="st-card-divider" />

            {/* Specialties */}
            <div className="st-section">
              <div className="st-section-title">Specialties</div>
              <div className="st-info-row">
                <span className="st-info-label">Specialties</span>
                {editing ? (
                  <div style={{ flex: 1 }}>
                    <div className="doc-spec-input">
                      {draft.specialtyIds.map(id => {
                        const sp = contextSpecialties.find(s => s.id === id)
                        return sp ? (
                          <span key={id} className="doc-spec-chip">
                            {sp.name}
                            <button type="button" className="doc-spec-chip-remove"
                              onMouseDown={e => { e.preventDefault(); setDraft(p => ({ ...p, specialtyIds: p.specialtyIds.filter(x => x !== id) })) }}>✕</button>
                          </span>
                        ) : null
                      })}
                      <input
                        className="doc-spec-search"
                        placeholder={draft.specialtyIds.length === 0 ? 'Search specialty...' : ''}
                        value={specialtySearch}
                        onChange={e => setSpecialtySearch(e.target.value)}
                      />
                    </div>
                    {specialtySearch && (
                      <ul className="doc-spec-dropdown">
                        {contextSpecialties.filter(s => s.name.toLowerCase().includes(specialtySearch.toLowerCase()) && !draft.specialtyIds.includes(s.id)).length > 0
                          ? contextSpecialties
                              .filter(s => s.name.toLowerCase().includes(specialtySearch.toLowerCase()) && !draft.specialtyIds.includes(s.id))
                              .map(s => (
                                <li key={s.id} className="doc-spec-dropdown-item"
                                  onMouseDown={e => { e.preventDefault(); setDraft(p => ({ ...p, specialtyIds: [...p.specialtyIds, s.id] })); setSpecialtySearch('') }}>
                                  {s.name}
                                </li>
                              ))
                          : <li className="doc-spec-dropdown-empty">No results found</li>
                        }
                      </ul>
                    )}
                  </div>
                ) : (
                  <span className="st-info-value">
                    {draft.specialtyIds.map(id => contextSpecialties.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '—'}
                  </span>
                )}
              </div>
            </div>

            <div className="st-card-divider" />

            {/* Qualifications */}
            <div className="st-section">
              <div className="st-section-title">Qualifications</div>
              <div className="st-info-row">
                <span className="st-info-label">Qualifications</span>
                {editing ? (
                  <div style={{ flex: 1 }}>
                    <div className="doc-spec-input">
                      {draft.qualificationIds.map(id => {
                        const q = qualifications.find(x => x.id === id)
                        return q ? (
                          <span key={id} className="doc-spec-chip">
                            {q.name}
                            <button type="button" className="doc-spec-chip-remove"
                              onMouseDown={e => { e.preventDefault(); setDraft(p => ({ ...p, qualificationIds: p.qualificationIds.filter(x => x !== id) })) }}>✕</button>
                          </span>
                        ) : null
                      })}
                      <input
                        className="doc-spec-search"
                        placeholder={draft.qualificationIds.length === 0 ? 'Search qualification...' : ''}
                        value={qualificationSearch}
                        onChange={e => setQualificationSearch(e.target.value)}
                      />
                    </div>
                    {qualificationSearch && (
                      <ul className="doc-spec-dropdown">
                        {qualifications.filter(q => q.name.toLowerCase().includes(qualificationSearch.toLowerCase()) && !draft.qualificationIds.includes(q.id)).length > 0
                          ? qualifications
                              .filter(q => q.name.toLowerCase().includes(qualificationSearch.toLowerCase()) && !draft.qualificationIds.includes(q.id))
                              .map(q => (
                                <li key={q.id} className="doc-spec-dropdown-item"
                                  onMouseDown={e => { e.preventDefault(); setDraft(p => ({ ...p, qualificationIds: [...p.qualificationIds, q.id] })); setQualificationSearch('') }}>
                                  {q.name}
                                </li>
                              ))
                          : <li className="doc-spec-dropdown-empty">No results found</li>
                        }
                      </ul>
                    )}
                  </div>
                ) : (
                  <span className="st-info-value">
                    {draft.qualificationIds.map(id => qualifications.find(q => q.id === id)?.name).filter(Boolean).join(', ') || '—'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'Doctor Profile' && (
          <div className="st-placeholder">{activeTab} settings coming soon.</div>
        )}
      </div>
    </div>
  )
}

export default DoctorSettings
