import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import arrowDown from '../assets/icons/arrow-down.svg'
import cameraIcon from '../assets/icons/camera-icon.svg'
import spotlightBg from '../assets/images/spotlight-bg.jpg'
import FormField from '../components/FormField'
import { getMedicalSystems, getSpecialties, createClinic } from '../services/api'
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

const CreateClinic: FC<CreateClinicProps> = ({ onCreated }) => {
  const [active, setActive] = useState(0)
  const [medicalSystems, setMedicalSystems] = useState<MedicalSystem[]>([])
  const [specialties, setSpecialties] = useState<Speciality[]>([])
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '', medicalSystemId: '', phoneNumber: '', emailAddress: '',
    websiteUrl: '', description: '',
    address: '', city: '', pinCode: '', district: '', state: '', country: '', latitude: '', longitude: '',
    ownerName: '', ownerPhone: '', ownerEmail: '',
  })

  useEffect(() => {
    getMedicalSystems().then(r => { if (r.success) setMedicalSystems(r.data) }).catch(() => {})
    getSpecialties().then(r => { if (r.success) setSpecialties(r.data) }).catch(() => {})
  }, [])

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const toggleSpecialty = (id: string) => {
    setSelectedSpecialtyIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    setErrors(prev => ({ ...prev, specialties: '' }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)) }
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (active === 0) {
      if (!form.name) e.name = 'Clinic name is required.'
      if (!form.medicalSystemId) e.medicalSystemId = 'Type of practice is required.'
      if (!form.phoneNumber) e.phoneNumber = 'Phone number is required.'
      if (!form.emailAddress) e.emailAddress = 'Email address is required.'
      if (selectedSpecialtyIds.length === 0) e.specialties = 'Select at least one specialty.'
    }
    if (active === 1) {
      if (!form.address) e.address = 'Address is required.'
      if (!form.city) e.city = 'City is required.'
      if (!form.pinCode) e.pinCode = 'Pin code is required.'
      if (!form.district) e.district = 'District is required.'
      if (!form.state) e.state = 'State is required.'
    }
    if (active === 2) {
      if (!form.ownerName) e.ownerName = 'Owner name is required.'
      if (!form.ownerPhone) e.ownerPhone = 'Phone number is required.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return
    if (active < tabs.length - 1) { setActive(a => a + 1) }
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phoneNumber', form.phoneNumber)
      fd.append('emailAddress', form.emailAddress)
      fd.append('address', form.address)
      fd.append('district', form.district)
      fd.append('state', form.state)
      fd.append('country', 'India')
      fd.append('medicalSystemId', form.medicalSystemId)
      if (form.websiteUrl) fd.append('websiteUrl', form.websiteUrl)
      if (form.description) fd.append('about', form.description)
      if (form.ownerName) fd.append('managerName', form.ownerName)
      if (form.ownerPhone) fd.append('managerPhoneNumber', form.ownerPhone)
      if (avatarFile) fd.append('profilePicture', avatarFile)
      selectedSpecialtyIds.forEach(id => fd.append('specialtyIds', id))
      fd.append('latitude', form.latitude || '0')
      fd.append('longitude', form.longitude || '0')
      await createClinic(fd)
      onCreated()
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create clinic.' })
    } finally {
      setLoading(false)
    }
  }

  const F = ({ name }: { name: string }) =>
    errors[name] ? <span className="cc-field-error">{errors[name]}</span> : null

  const renderForm = () => {
    if (active === 0) return (
      <div className="cc-form">
        <h3 className="cc-form-title">Basic Information</h3>
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
        <div className="cc-row">
          <div className="cc-field-wrap">
            <FormField label="Clinic Name" placeholder="Enter clinic name" value={form.name} onChange={set('name')} />
            <F name="name" />
          </div>
          <div className="cc-field-wrap">
            <FormField as="select" label="Type of Practice" value={form.medicalSystemId} onChange={set('medicalSystemId')}
              options={medicalSystems.map(m => ({ label: m.name, value: m.id }))} />
            <F name="medicalSystemId" />
          </div>
        </div>
        <div className="cc-row">
          <div className="cc-field-wrap">
            <FormField label="Phone Number" type="tel" placeholder="Enter phone number" value={form.phoneNumber} onChange={set('phoneNumber')} />
            <F name="phoneNumber" />
          </div>
          <div className="cc-field-wrap">
            <FormField label="Email Address" type="email" placeholder="Enter email address" value={form.emailAddress} onChange={set('emailAddress')} />
            <F name="emailAddress" />
          </div>
        </div>
        <FormField label="Website" type="url" placeholder="https://..." value={form.websiteUrl} onChange={set('websiteUrl')} showRequired={false} />
        <div>
          <div className="cc-field-label">Type of Specialties <span className="cc-required">*</span></div>
          <div className="cc-specialty-grid">
            {specialties.map(s => (
              <button key={s.id} type="button"
                className={`cc-specialty-chip ${selectedSpecialtyIds.includes(s.id) ? 'selected' : ''}`}
                onClick={() => toggleSpecialty(s.id)}>{s.name}</button>
            ))}
          </div>
          <F name="specialties" />
        </div>
        <div>
          <div className="cc-field-label">Description <span className="cc-optional">(Optional)</span></div>
          <textarea className="cc-textarea" placeholder="Brief description about your clinic"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
        </div>
      </div>
    )
    if (active === 1) return (
      <div className="cc-form">
        <h3 className="cc-form-title">Address Information</h3>
        <div className="cc-row">
          <div className="cc-field-wrap">
            <FormField label="Address" placeholder="Enter address" value={form.address} onChange={set('address')} />
            <F name="address" />
          </div>
          <div className="cc-field-wrap">
            <FormField label="City" placeholder="Enter city" value={form.city} onChange={set('city')} />
            <F name="city" />
          </div>
        </div>
        <div className="cc-row">
          <div className="cc-field-wrap">
            <FormField label="Pin Code" placeholder="Enter pin code" value={form.pinCode} onChange={set('pinCode')} />
            <F name="pinCode" />
          </div>
          <div className="cc-field-wrap">
            <FormField label="District" placeholder="Enter district" value={form.district} onChange={set('district')} />
            <F name="district" />
          </div>
        </div>
        <div className="cc-row">
          <div className="cc-field-wrap">
            <FormField label="State" placeholder="Enter state" value={form.state} onChange={set('state')} />
            <F name="state" />
          </div>
          <FormField label="Country" placeholder="Enter country" value={form.country} onChange={set('country')} showRequired={false} />
        </div>
        <div className="cc-row">
          <FormField label="Latitude" type="number" placeholder="e.g. 12.9716" value={form.latitude} onChange={set('latitude')} showRequired={false} />
          <FormField label="Longitude" type="number" placeholder="e.g. 77.5946" value={form.longitude} onChange={set('longitude')} showRequired={false} />
        </div>
      </div>
    )
    if (active === 2) return (
      <div className="cc-form">
        <h3 className="cc-form-title">Owner Details</h3>
        <div className="cc-field-wrap">
          <FormField label="Owner / Admin Name" placeholder="Enter owner name" value={form.ownerName} onChange={set('ownerName')} />
          <F name="ownerName" />
        </div>
        <div className="cc-field-wrap">
          <FormField label="Phone Number" type="tel" placeholder="Enter phone number" value={form.ownerPhone} onChange={set('ownerPhone')} />
          <F name="ownerPhone" />
        </div>
        <FormField label="Email" type="email" placeholder="Enter email address" value={form.ownerEmail} onChange={set('ownerEmail')} showRequired={false} />
      </div>
    )
    return null
  }

  return (
    <div className="cc-fullscreen" style={{ backgroundImage: `url(${spotlightBg})` }}>
      <div className="cc-box">
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
        <div className="cc-form-area">{renderForm()}</div>
        <div className="cc-footer">
          {errors.submit && <span className="cc-error">{errors.submit}</span>}
          {active > 0 && (
            <button className="cc-btn-back" onClick={() => { setErrors({}); setActive(a => a - 1) }}>Back</button>
          )}
          <button className="cc-btn-continue" disabled={loading} onClick={handleContinue}>
            {active === tabs.length - 1 ? (loading ? 'Creating...' : 'Submit') : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateClinic
