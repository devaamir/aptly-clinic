import type { FC, ChangeEvent } from 'react'
import { useState, useEffect } from 'react'
import avatarIcon from '../assets/icons/avatar-icon.svg'
import cameraIcon from '../assets/icons/camera-icon.svg'
import { updateClinic, createSubscriptionCheckout, getSubscriptionStatus } from '../services/api'
import { useAppContext } from '../context/AppContext'
import Modal from '../components/Modal'
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

  const emptyProfile = {
    name: '', practice: '', phone: '', email: '', website: '',
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

  const allSpecialties = contextSpecialties.map(s => s.name)

  const set = (key: keyof typeof profile) => (v: string) => setDraft(p => ({ ...p, [key]: v }))

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleEdit = () => { setDraft(profile); setEditing(true) }
  const handleCancel = () => { setEditing(false); setSaveError('') }
  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const fd = new FormData()
      if (draft.name) fd.append('name', draft.name)
      if (draft.phone) fd.append('phoneNumber', draft.phone)
      if (draft.email) fd.append('emailAddress', draft.email)
      if (draft.about) fd.append('about', draft.about)
      if (draft.website) fd.append('websiteUrl', draft.website)
      if (draft.address) fd.append('address', draft.address)
      if (draft.lat) fd.append('latitude', draft.lat)
      if (draft.lng) fd.append('longitude', draft.lng)
      // map specialty names back to IDs
      draft.specialties.forEach(name => {
        const found = contextSpecialties.find(s => s.name === name)
        if (found) fd.append('specialtyIds', found.id)
      })
      await updateClinic(fd)
      setProfile(draft)
      setEditing(false)
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
                  <img src={draft.avatar || avatarIcon} alt="clinic" className="st-avatar" />
                  <div className="st-camera-btn">
                    <img src={cameraIcon} alt="" style={{ width: 16, height: 16 }} />
                  </div>
                </div>
                <div className="st-info-grid">
                  <InfoRow label="Clinic Name" value={draft.name} editing={editing} onChange={set('name')} />
                  <InfoRow label="Medical System" value={draft.practice} editing={editing} onChange={set('practice')} />
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
