import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import arrowDown from '../assets/icons/arrow-down.svg'
import cameraIcon from '../assets/icons/camera-icon.svg'
import FormField from '../components/FormField'
import { getMedicalSystems, getSpecialties } from '../services/api'
import type { MedicalSystem, Speciality } from '../services/types'
import './CreateClinic.css'

interface CreateClinicProps {
  onCreated: () => void
  onBack: () => void
}

const tabs = [
  { step: '1', title: 'Basic Information', sub: 'Tell us about your clinic' },
  { step: '2', title: 'Address Information', sub: 'Where your clinic is located' },
  { step: '3', title: 'Owner Details', sub: 'Tell us about the owner' },
]

const CreateClinic: FC<CreateClinicProps> = () => {
  const [active, setActive] = useState(0)
  const [medicalSystems, setMedicalSystems] = useState<MedicalSystem[]>([])
  const [specialties, setSpecialties] = useState<Speciality[]>([])
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '', medicalSystemId: '', phoneNumber: '', emailAddress: '',
    websiteUrl: '', description: '',
    address: '', city: '', pinCode: '', district: '', state: '', mapLink: '',
    ownerName: '', ownerPhone: '', ownerEmail: '',
  })

  useEffect(() => {
    getMedicalSystems().then(r => { if (r.success) setMedicalSystems(r.data) }).catch(() => {})
    getSpecialties().then(r => { if (r.success) setSpecialties(r.data) }).catch(() => {})
  }, [])

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const toggleSpecialty = (id: string) =>
    setSelectedSpecialtyIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatarPreview(URL.createObjectURL(file))
  }

  const renderForm = () => {
    if (active === 0) return (
      <div className="cc-form">
        <h3 className="cc-form-title">Basic Information</h3>

        {/* Profile Picture */}
        <div className="cc-profile-pic" onClick={() => fileInputRef.current?.click()}>
          {avatarPreview
            ? <img src={avatarPreview} alt="clinic" className="cc-profile-img" />
            : <div className="cc-profile-placeholder">
                <img src={cameraIcon} alt="" style={{ width: 24, height: 24 }} />
                <div className="cc-profile-placeholder-text">
                  <span className="cc-profile-desc">Upload a clinic picture. Max size 5MB</span>
                </div>
                <span className="cc-profile-browse">Browse</span>
              </div>
          }
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </div>

        {/* Clinic Name + Type of Practice */}
        <div className="cc-row">
          <FormField label="Clinic Name" placeholder="Enter clinic name" value={form.name} onChange={set('name')} />
          <FormField as="select" label="Type of Practice" value={form.medicalSystemId} onChange={set('medicalSystemId')}
            options={medicalSystems.map(m => ({ label: m.name, value: m.id }))} />
        </div>

        {/* Phone + Email */}
        <div className="cc-row">
          <FormField label="Phone Number" type="tel" placeholder="Enter phone number" value={form.phoneNumber} onChange={set('phoneNumber')} />
          <FormField label="Email Address" type="email" placeholder="Enter email address" value={form.emailAddress} onChange={set('emailAddress')} />
        </div>

        {/* Website */}
        <FormField label="Website" type="url" placeholder="https://..." value={form.websiteUrl} onChange={set('websiteUrl')} showRequired={false} />

        {/* Specialties */}
        <div className="cc-field-label">Type of Specialties <span className="cc-required">*</span></div>
        <div className="cc-specialty-grid">
          {specialties.map(s => (
            <button key={s.id} type="button"
              className={`cc-specialty-chip ${selectedSpecialtyIds.includes(s.id) ? 'selected' : ''}`}
              onClick={() => toggleSpecialty(s.id)}>
              {s.name}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="cc-field-label">Description <span className="cc-optional">(Optional)</span></div>
        <textarea className="cc-textarea" placeholder="Brief description about your clinic"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
      </div>
    )
    if (active === 1) return (
      <div className="cc-form">
        <h3 className="cc-form-title">Address Information</h3>
        <div className="cc-row">
          <FormField label="Address" placeholder="Enter address" value={form.address} onChange={set('address')} />
          <FormField label="City" placeholder="Enter city" value={form.city} onChange={set('city')} />
        </div>
        <div className="cc-row">
          <FormField label="Pin Code" placeholder="Enter pin code" value={form.pinCode} onChange={set('pinCode')} />
          <FormField label="District" placeholder="Enter district" value={form.district} onChange={set('district')} />
        </div>
        <div className="cc-row">
          <FormField label="State" placeholder="Enter state" value={form.state} onChange={set('state')} />
          <FormField label="Map Link" placeholder="Drop your map link here" value={form.mapLink} onChange={set('mapLink')} showRequired={false} />
        </div>
      </div>
    )
    if (active === 2) return (
      <div className="cc-form">
        <h3 className="cc-form-title">Owner Details</h3>
        <FormField label="Owner / Admin Name" placeholder="Enter owner name" value={form.ownerName} onChange={set('ownerName')} />
        <FormField label="Phone Number" type="tel" placeholder="Enter phone number" value={form.ownerPhone} onChange={set('ownerPhone')} />
        <FormField label="Email" type="email" placeholder="Enter email address" value={form.ownerEmail} onChange={set('ownerEmail')} showRequired={false} />
      </div>
    )
    return <div className="cc-form" />
  }

  return (
    <div className="cc-fullscreen">
      <div className="cc-box">
        {/* Top - Tabs */}
        <div className="cc-tabs">
          {tabs.map((t, i) => (
            <div key={i} className={`cc-tab ${active === i ? 'cc-tab-active' : ''}`}>
              <div className={`cc-tab-step ${active === i ? 'cc-tab-step-active' : ''}`}>{t.step}</div>
              <div className="cc-tab-text">
                <span className="cc-tab-title">{t.title}</span>
                <span className="cc-tab-sub">{t.sub}</span>
              </div>
              <img src={arrowDown} alt="" style={{ width: 20, height: 20, marginLeft: 'auto', transform: 'rotate(-90deg)' }} />
            </div>
          ))}
        </div>

        {/* Middle - Form */}
        <div className="cc-form-area">{renderForm()}</div>

        {/* Bottom - Navigation */}
        <div className="cc-footer">
          {active > 0 && (
            <button className="cc-btn-back" onClick={() => setActive(a => a - 1)}>Back</button>
          )}
          <button className="cc-btn-continue" onClick={() => active < tabs.length - 1 ? setActive(a => a + 1) : undefined}>
            {active === tabs.length - 1 ? 'Submit' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateClinic
