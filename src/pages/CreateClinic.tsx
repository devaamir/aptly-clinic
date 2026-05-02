import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { createClinic, getMedicalSystems, getSpecialties } from '../services/api'
import type { MedicalSystem, Speciality } from '../services/types'
import cameraIcon from '../assets/icons/camera-icon.svg'
import './CreateClinic.css'

interface CreateClinicProps {
  onCreated: () => void
  onBack: () => void
}

const CreateClinic: FC<CreateClinicProps> = ({ onCreated, onBack }) => {
  const [medicalSystems, setMedicalSystems] = useState<MedicalSystem[]>([])
  const [specialties, setSpecialties] = useState<Speciality[]>([])

  useEffect(() => {
    getMedicalSystems().then(r => { if (r.success) setMedicalSystems(r.data) }).catch(() => {})
    getSpecialties().then(r => { if (r.success) setSpecialties(r.data) }).catch(() => {})
  }, [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', phoneNumber: '', emailAddress: '', about: '',
    alternatePhoneNumber: '', websiteUrl: '',
    latitude: '', longitude: '', address: '',
    district: '', state: '', country: '',
    medicalSystemId: '', managerName: '', managerPhoneNumber: '',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const toggleSpecialty = (id: string) =>
    setSelectedSpecialtyIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const isValid = form.name && form.phoneNumber && form.emailAddress &&
    form.latitude && form.longitude && form.address &&
    form.district && form.state && form.country &&
    form.medicalSystemId && selectedSpecialtyIds.length > 0

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phoneNumber', form.phoneNumber)
      fd.append('emailAddress', form.emailAddress)
      fd.append('latitude', form.latitude)
      fd.append('longitude', form.longitude)
      fd.append('address', form.address)
      fd.append('district', form.district)
      fd.append('state', form.state)
      fd.append('country', form.country)
      fd.append('medicalSystemId', form.medicalSystemId)
      if (form.about) fd.append('about', form.about)
      if (form.alternatePhoneNumber) fd.append('alternatePhoneNumber', form.alternatePhoneNumber)
      if (form.websiteUrl) fd.append('websiteUrl', form.websiteUrl)
      if (form.managerName) fd.append('managerName', form.managerName)
      if (form.managerPhoneNumber) fd.append('managerPhoneNumber', form.managerPhoneNumber)
      if (avatarFile) fd.append('profilePicture', avatarFile)
      selectedSpecialtyIds.forEach(id => fd.append('specialtyIds', id))
      await createClinic(fd)
      onCreated()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create clinic profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="cc-content">
        <h1 className="cc-title">Create Clinic Profile</h1>
        <p className="cc-subtitle">Set up your clinic to get started</p>
        <button className="cc-back-btn" onClick={onBack}>← Back to Login</button>

        {/* Avatar */}
        <div className="cc-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
          {avatarPreview
            ? <img src={avatarPreview} alt="clinic" className="cc-avatar-img" />
            : <div className="cc-avatar-placeholder"><img src={cameraIcon} alt="" /></div>
          }
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        </div>

        {error && <div className="cc-error">{error}</div>}

        <div className="cc-form">
          <div className="cc-section-title">Basic Info</div>
          <FormField label="Clinic Name" placeholder="Enter clinic name" value={form.name} onChange={set('name')} />
          <FormField label="Phone Number" type="tel" placeholder="Enter phone number" value={form.phoneNumber} onChange={set('phoneNumber')} />
          <FormField label="Email Address" type="email" placeholder="Enter email address" value={form.emailAddress} onChange={set('emailAddress')} />
          <FormField label="About" placeholder="Brief description" value={form.about} onChange={set('about')} showRequired={false} />
          <FormField label="Alternate Phone" type="tel" placeholder="Alternate phone number" value={form.alternatePhoneNumber} onChange={set('alternatePhoneNumber')} showRequired={false} />
          <FormField label="Website URL" type="url" placeholder="https://..." value={form.websiteUrl} onChange={set('websiteUrl')} showRequired={false} />

          <div className="cc-section-title">Location</div>
          <FormField label="Address" placeholder="Street address" value={form.address} onChange={set('address')} />
          <div className="cc-row">
            <FormField label="District" placeholder="District" value={form.district} onChange={set('district')} />
            <FormField label="State" placeholder="State" value={form.state} onChange={set('state')} />
          </div>
          <div className="cc-row">
            <FormField label="Country" placeholder="Country" value={form.country} onChange={set('country')} />
          </div>
          <div className="cc-row">
            <FormField label="Latitude" type="number" placeholder="e.g. 12.9716" value={form.latitude} onChange={set('latitude')} />
            <FormField label="Longitude" type="number" placeholder="e.g. 77.5946" value={form.longitude} onChange={set('longitude')} />
          </div>

          <div className="cc-section-title">Medical Details</div>
          <FormField
            as="select"
            label="Medical System"
            value={form.medicalSystemId}
            onChange={set('medicalSystemId')}
            options={medicalSystems.map(m => ({ label: m.name, value: m.id }))}
          />

          <div className="cc-field">
            <label className="cc-label">Specialties <span className="cc-required"> *</span></label>
            <div className="cc-specialty-grid">
              {specialties.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`cc-specialty-chip ${selectedSpecialtyIds.includes(s.id) ? 'selected' : ''}`}
                  onClick={() => toggleSpecialty(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="cc-section-title">Manager Info</div>
          <FormField label="Manager Name" placeholder="Manager's name" value={form.managerName} onChange={set('managerName')} showRequired={false} />
          <FormField label="Manager Phone" type="tel" placeholder="Manager's phone number" value={form.managerPhoneNumber} onChange={set('managerPhoneNumber')} showRequired={false} />

          <button className="cc-btn" onClick={handleSubmit} disabled={loading || !isValid}>
            {loading ? 'Creating...' : 'Create Clinic'}
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}

export default CreateClinic
