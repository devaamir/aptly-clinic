import type { FC, ChangeEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import avatarIcon from '../assets/icons/avatar-icon.svg'
import cameraIcon from '../assets/icons/camera-icon.svg'
import { updateClinic, createSubscriptionCheckout, getSubscriptionStatus, getMedicalSystems } from '../services/api'
import type { MedicalSystem } from '../services/types'
import { useAppContext } from '../context/AppContext'
import Modal from '../components/Modal'
import './Settings.css'
import './Doctors.css'

type SettingsTab = 'Clinic Profile' | 'Consulting Rooms' | 'Notifications' | 'Security' | 'Billing' | 'Integrations'
const tabs: SettingsTab[] = ['Clinic Profile', 'Consulting Rooms', 'Notifications', 'Security', 'Billing', 'Integrations']

const InfoRow: FC<{ label: string; value: string; editing?: boolean; onChange?: (v: string) => void; multiline?: boolean; error?: string; digitsOnly?: boolean; prefix?: string; placeholder?: string }> = ({ label, value, editing, onChange, multiline, error, digitsOnly, prefix, placeholder }) => (
  <div className="st-info-row">
    <span className="st-info-label">{label}</span>
    {editing
      ? multiline
        ? <textarea className="st-edit-input st-edit-textarea" value={value} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} />
        : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className={prefix ? 'st-phone-wrap' : undefined}>
              {prefix && <span className="st-phone-prefix">{prefix}</span>}
              <input
                className={`st-edit-input${prefix ? ' st-phone-input' : ''}${error ? ' st-edit-input--error' : ''}`}
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
      : <span className="st-info-value">{value ? (prefix ? `${prefix} ${value}` : value) : '—'}</span>
    }
  </div>
)

// null = not purchased, otherwise expiry date string
type PlanStatus = 'none' | 'active' | 'expiring' | 'expired'
type BillingModal = 'purchase' | 'renew' | 'cancel' | null

const getPlanStatus = (expiresAt: string | null): PlanStatus => {
  if (!expiresAt) return 'none'
  const diff = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'expired'
  if (diff <= 7) return 'expiring'
  return 'active'
}

const BillingTab: FC = () => {
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const [modal, setModal] = useState<BillingModal>(null)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    getSubscriptionStatus()
      .then(r => { setExpiresAt(r.data.trialExpiresAt); setSubStatus(r.data.subscriptionStatus) })
      .catch(() => {})
  }, [])

  const status = subStatus === 'active' ? getPlanStatus(expiresAt) : 'none'

  const handleSubscribe = async () => {
    setSubscribing(true)
    try {
      const res = await createSubscriptionCheckout('monthly')
      window.location.href = res.data.checkoutUrl
    } catch {
      setSubscribing(false)
    }
  }

  const badge = {
    none:     { bg: '#F2F4F7', color: '#636A79', label: 'Not Active' },
    active:   { bg: '#E6F9F0', color: '#12B76A', label: 'Active' },
    expiring: { bg: '#FFF4E5', color: '#F59E0B', label: 'Expiring Soon' },
    expired:  { bg: '#FEE4E2', color: '#E53E3E', label: 'Expired' },
  }[status]

  return (
    <>
      <div className="st-card">
        <div className="st-card-header">
          <div>
            <span className="st-card-title">Billing & Subscription</span>
            <p className="st-subtitle" style={{ margin: '2px 0 0' }}>Manage your subscription and payment methods</p>
          </div>
        </div>
        <div className="st-card-divider" />
        <div className="st-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', fontFamily: 'Manrope' }}>Professional Plan</div>
              <div style={{ fontSize: 13, color: '#636A79', fontFamily: 'Manrope', marginTop: 2 }}>Billed annually</div>
            </div>
            <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'Manrope' }}>{badge.label}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Manrope' }}>
            ₹999<span style={{ fontSize: 14, fontWeight: 400, color: '#636A79' }}>/month</span>
          </div>
          {expiresAt && status !== 'none' && (
            <div style={{ fontSize: 13, color: status === 'expiring' ? '#F59E0B' : '#636A79', fontFamily: 'Manrope' }}>
              {status === 'expired' ? 'Expired on ' : 'Renews on '}{new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            {(status === 'none' || status === 'expired') && <button className="st-edit-btn" onClick={() => setModal('purchase')}>Subscribe</button>}
            {(status === 'expiring') && <button className="st-edit-btn" onClick={() => setModal('renew')}>Renew</button>}
            {(status === 'active' || status === 'expiring') && (
              <button onClick={() => setModal('cancel')} style={{ padding: '8px 16px', background: '#FEE4E2', color: '#E53E3E', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'Manrope', cursor: 'pointer' }}>Cancel</button>
            )}
          </div>
        </div>
      </div>

      {modal === 'purchase' && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ padding: '24px', fontFamily: 'Manrope' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>Subscribe to Professional Plan</div>
            <div style={{ fontSize: 14, color: '#636A79', marginBottom: 20 }}>You're about to subscribe to the <strong>Professional Plan</strong> at <strong>₹999/month</strong>, billed annually.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="st-cancel-btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="st-edit-btn" onClick={handleSubscribe} disabled={subscribing}>{subscribing ? 'Redirecting...' : 'Confirm Subscribe'}</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'renew' && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ padding: '24px', fontFamily: 'Manrope' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>Renew Professional Plan</div>
            <div style={{ fontSize: 14, color: '#636A79', marginBottom: 20 }}>Your plan is expiring soon. Renew now to avoid any interruption in service. <strong>₹999/month</strong>, billed annually.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="st-cancel-btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="st-edit-btn">Confirm Renewal</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'cancel' && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ padding: '24px', fontFamily: 'Manrope' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E53E3E', marginBottom: 8 }}>Cancel Subscription</div>
            <div style={{ fontSize: 14, color: '#636A79', marginBottom: 20 }}>Are you sure you want to cancel your subscription? You'll lose access at the end of the current billing period.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="st-cancel-btn" onClick={() => setModal(null)}>Keep Plan</button>
              <button onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#FEE4E2', color: '#E53E3E', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'Manrope', cursor: 'pointer' }}>Yes, Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

const Settings: FC = () => {
  const { activeContext, specialties: contextSpecialties, setActiveContext } = useAppContext()
  const mc = activeContext?.medicalCenter

  const [activeTab, setActiveTab] = useState<SettingsTab>('Clinic Profile')
  const [editing, setEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarFileRef = useRef<File | null>(null)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const emptyProfile = {
    name: '', practice: '', medicalSystemId: '', phone: '', email: '', website: '',
    specialties: [] as string[], about: '', address: '',
    lat: '', lng: '', ownerName: '', ownerPhone: '', ownerEmail: '', avatar: '',
  }
  const [profile, setProfile] = useState(emptyProfile)
  const [draft, setDraft] = useState(emptyProfile)

  useEffect(() => {
    if (!mc) return
    const p = {
      name: mc.name ?? '',
      practice: mc.medicalSystem?.name ?? '',
      medicalSystemId: mc.medicalSystem?.id ?? '',
      phone: mc.phoneNumber ?? '',
      email: mc.emailAddress ?? '',
      website: mc.websiteUrl ?? '',
      specialties: mc.specialties?.map(s => s.name) ?? [],
      about: mc.about ?? '',
      address: mc.address ?? '',
      lat: mc.latitude != null ? String(mc.latitude) : '',
      lng: mc.longitude != null ? String(mc.longitude) : '',
      ownerName: mc.creatorManager?.name ?? '',
      ownerPhone: mc.creatorManager?.phoneNumber ?? '',
      ownerEmail: mc.creatorManager?.emailAddress ?? '',
      avatar: mc.profilePicture ?? '',
    }
    setProfile(p)
    setDraft(p)
  }, [mc])

  const set = (key: keyof typeof profile) => (v: string) => {
    setDraft(p => ({ ...p, [key]: v }))
    setFieldErrors(p => ({ ...p, [key]: '' }))
  }

  const [medicalSystems, setMedicalSystems] = useState<MedicalSystem[]>([])
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [specialtyFocused, setSpecialtyFocused] = useState(false)

  useEffect(() => {
    getMedicalSystems().then(r => { if (r.success) setMedicalSystems(r.data) }).catch(() => {})
  }, [])

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isValidIndianPhone = (v: string) => /^[6-9]\d{9}$/.test(v.trim())
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

  const validateBeforeSave = () => {
    const errs: Record<string, string> = {}
    if (draft.phone && !isValidIndianPhone(draft.phone))
      errs.phone = 'Enter a valid 10-digit Indian mobile number.'
    if (draft.ownerPhone && !isValidIndianPhone(draft.ownerPhone))
      errs.ownerPhone = 'Enter a valid 10-digit Indian mobile number.'
    if (draft.email && !isValidEmail(draft.email))
      errs.email = 'Enter a valid email address.'
    if (draft.ownerEmail && !isValidEmail(draft.ownerEmail))
      errs.ownerEmail = 'Enter a valid email address.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleEdit = () => { setDraft(profile); setEditing(true); setFieldErrors({}); avatarFileRef.current = null }
  const handleCancel = () => { setDraft(profile); setEditing(false); setSaveError(''); setFieldErrors({}); avatarFileRef.current = null }
  const handleSave = async () => {
    if (!validateBeforeSave()) return
    setSaving(true)
    setSaveError('')
    try {
      const fd = new FormData()
      if (draft.name) fd.append('name', draft.name)
      if (draft.medicalSystemId) fd.append('medicalSystemId', draft.medicalSystemId)
      if (draft.phone) fd.append('phoneNumber', draft.phone)
      if (draft.email) fd.append('emailAddress', draft.email)
      if (draft.about) fd.append('about', draft.about)
      if (draft.website) fd.append('websiteUrl', draft.website)
      if (draft.address) fd.append('address', draft.address)
      if (draft.lat) fd.append('latitude', draft.lat)
      if (draft.lng) fd.append('longitude', draft.lng)
      if (avatarFileRef.current) fd.append('profilePicture', avatarFileRef.current)
      // map specialty names back to IDs
      draft.specialties.forEach(name => {
        const found = contextSpecialties.find(s => s.name === name)
        if (found) fd.append('specialtyIds', found.id)
      })
      const res = await updateClinic(fd)
      const newAvatar = res.data?.profilePicture ?? draft.avatar
      setProfile({ ...draft, avatar: newAvatar })
      setDraft(p => ({ ...p, avatar: newAvatar }))
      setEditing(false)
      avatarFileRef.current = null
      // update context immediately
      if (activeContext) {
        setActiveContext({
          ...activeContext,
          medicalCenter: {
            ...activeContext.medicalCenter,
            name: draft.name,
            phoneNumber: draft.phone,
            emailAddress: draft.email,
            about: draft.about,
            websiteUrl: draft.website,
            address: draft.address,
            latitude: parseFloat(draft.lat) || 0,
            longitude: parseFloat(draft.lng) || 0,
            profilePicture: newAvatar,
            specialties: contextSpecialties.filter(s => draft.specialties.includes(s.name)),
          }
        })
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
                <div className="st-avatar-wrap">
                  <img
                    src={draft.avatar || avatarIcon}
                    alt="clinic"
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
                    style={{
                      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1000,
                    }}
                    onClick={() => setShowAvatarModal(false)}
                  >
                    <div
                      style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setShowAvatarModal(false)}
                        style={{
                          position: 'absolute', top: -16, right: -16,
                          width: 32, height: 32, borderRadius: '50%',
                          background: '#fff', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 700, color: '#0A0A0A',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >✕</button>
                      <img
                        src={draft.avatar || avatarIcon}
                        alt="clinic"
                        style={{
                          maxWidth: '80vw', maxHeight: '80vh',
                          borderRadius: 12, display: 'block',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="st-info-grid">
                  <InfoRow label="Clinic Name" value={draft.name} editing={editing} onChange={set('name')} placeholder="Enter clinic name" />
                  <div className="st-info-row">
                    <span className="st-info-label">Medical System</span>
                    {editing ? (
                      <select
                        className="st-edit-input"
                        value={draft.medicalSystemId}
                        onChange={e => {
                          const selected = medicalSystems.find(m => m.id === e.target.value)
                          setDraft(p => ({ ...p, medicalSystemId: e.target.value, practice: selected?.name ?? '' }))
                        }}
                      >
                        <option value="">Select medical system</option>
                        {medicalSystems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    ) : (
                      <span className="st-info-value">{draft.practice || '—'}</span>
                    )}
                  </div>
                  <InfoRow label="Phone Number" value={draft.phone} editing={editing} onChange={set('phone')} digitsOnly prefix="+91" error={fieldErrors.phone} placeholder="98765 43210" />
                  <InfoRow label="Email" value={draft.email} editing={editing} onChange={set('email')} error={fieldErrors.email} placeholder="clinic@example.com" />
                  <InfoRow label="Website" value={draft.website} editing={editing} onChange={set('website')} placeholder="https://yourclinic.com" />
                  <div className="st-info-row">
                    <span className="st-info-label">Specialty</span>
                    {editing ? (
                      <div style={{ flex: 1 }}>
                        <div className="doc-spec-input">
                          {draft.specialties.map(s => (
                            <span key={s} className="doc-spec-chip">
                              {s}
                              <button type="button" className="doc-spec-chip-remove"
                                onMouseDown={e => { e.preventDefault(); setDraft(p => ({ ...p, specialties: p.specialties.filter(x => x !== s) })) }}>✕</button>
                            </span>
                          ))}
                          <input
                            className="doc-spec-search"
                            placeholder={draft.specialties.length === 0 ? 'Search specialty...' : ''}
                            value={specialtySearch}
                            onChange={e => setSpecialtySearch(e.target.value)}
                            onFocus={() => setSpecialtyFocused(true)}
                            onBlur={() => setTimeout(() => setSpecialtyFocused(false), 150)}
                            onKeyDown={e => {
                              if (e.key === 'Backspace' && !specialtySearch && draft.specialties.length > 0) {
                                setDraft(p => ({ ...p, specialties: p.specialties.slice(0, -1) }))
                              }
                            }}
                          />
                        </div>
                        {specialtyFocused && (() => {
                          const filtered = contextSpecialties.filter(s =>
                            s.name.toLowerCase().includes(specialtySearch.toLowerCase()) && !draft.specialties.includes(s.name)
                          )
                          if (filtered.length === 0 && !specialtySearch) return null
                          return (
                            <ul className="doc-spec-dropdown">
                              {filtered.length > 0
                                ? filtered.map(s => (
                                    <li key={s.id} className="doc-spec-dropdown-item"
                                      onMouseDown={e => { e.preventDefault(); setDraft(p => ({ ...p, specialties: [...p.specialties, s.name] })); setSpecialtySearch('') }}>
                                      {s.name}
                                    </li>
                                  ))
                                : <li className="doc-spec-dropdown-empty">No results found</li>
                              }
                            </ul>
                          )
                        })()}
                      </div>
                    ) : (
                      <span className="st-info-value">{draft.specialties.join(', ') || '—'}</span>
                    )}
                  </div>
                </div>
              </div>
              <InfoRow label="About Clinic" value={draft.about} editing={editing} onChange={set('about')} multiline placeholder="Brief description about your clinic" />
              <InfoRow label="Address" value={draft.address} editing={editing} onChange={set('address')} placeholder="Enter full clinic address" />
              <div className="st-info-grid">
                <InfoRow label="Latitude" value={draft.lat} editing={editing} onChange={set('lat')} placeholder="e.g. 12.9716" />
                <InfoRow label="Longitude" value={draft.lng} editing={editing} onChange={set('lng')} placeholder="e.g. 77.5946" />
              </div>
            </div>

            <div className="st-card-divider" />

            <div className="st-section">
              <div className="st-section-title">Owner Details</div>
              <div className="st-info-grid">
                <InfoRow label="Owner Name" value={draft.ownerName} editing={editing} onChange={set('ownerName')} placeholder="Enter owner name" />
                <InfoRow label="Phone Number" value={draft.ownerPhone} editing={editing} onChange={set('ownerPhone')} digitsOnly prefix="+91" error={fieldErrors.ownerPhone} placeholder="98765 43210" />
                <InfoRow label="Email" value={draft.ownerEmail} editing={editing} onChange={set('ownerEmail')} error={fieldErrors.ownerEmail} placeholder="owner@example.com" />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Billing' && (
          <BillingTab />
        )}
        {activeTab !== 'Clinic Profile' && activeTab !== 'Billing' && (
          <div className="st-placeholder">{activeTab} settings coming soon.</div>
        )}
      </div>
    </div>
  )
}

export default Settings
