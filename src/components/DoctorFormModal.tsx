import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import { createDoctor, updateDoctor, getDoctorsList } from '../services/api'
import type { DoctorDetail, DoctorListItem } from '../services/types'
import { useAppContext } from '../context/AppContext'
import cameraIcon from '../assets/icons/camera-icon.svg'
import smsIcon from '../assets/icons/sms.svg'
import avatarIcon from '../assets/icons/avatar-icon.svg'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import '../pages/Doctors.css'

interface DoctorFormModalProps {
  /** Pass a doctor to open in edit mode, omit for create mode */
  doctor?: DoctorDetail
  onClose: () => void
  /** Called after successful create with the raw API doctor data */
  onCreated?: (doctor: import('../services/types').AppointmentDoctor) => void
  /** Called after successful edit with the merged doctor detail */
  onUpdated?: (doctor: DoctorDetail) => void
}

type ApiError = { response?: { data?: { errors?: { field: string; message: string }[]; message?: string } } }

const FIELD_MAP: Record<string, string> = {
  phoneNumber: 'phoneNumber',
  emailAddress: 'emailAddress',
  name: 'name',
  medicalSystemId: 'medicalSystemId',
  yearsOfExperience: 'yearsOfExperience',
}

const DoctorFormModal: FC<DoctorFormModalProps> = ({ doctor, onClose, onCreated, onUpdated }) => {
  const isEdit = !!doctor
  const { specialties, medicalSystems, qualifications } = useAppContext()

  // Form state
  const [form, setForm] = useState({
    name: doctor?.name ?? '',
    phoneNumber: '',
    emailAddress: doctor?.emailAddress ?? '',
    about: doctor?.about ?? '',
    consultationFee: doctor?.consultationFee?.toString() ?? '',
    yearsOfExperience: doctor?.yearsOfExperience?.toString() ?? '',
    advanceBookingLimit: doctor?.advanceBookingLimit?.toString() ?? '',
    estimateConsultationTime: doctor?.estimateConsultationTime?.toString() ?? '',
    medicalSystemId: doctor?.medicalSystem?.id ?? '',
  })
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(doctor?.specialties.map(s => s.id) ?? [])
  const [selectedQualificationIds, setSelectedQualificationIds] = useState<string[]>(doctor?.qualifications.map(q => q.id) ?? [])

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(doctor?.profilePicture ?? null)
  const avatarFileRef = useRef<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Name search (create mode only)
  const [nameSearch, setNameSearch] = useState(doctor?.name ?? '')
  const [nameResults, setNameResults] = useState<DoctorListItem[]>([])
  const [nameSearchLoading, setNameSearchLoading] = useState(false)
  const nameSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameInputRef = useRef<HTMLDivElement>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListItem | null>(null)

  // Specialty / qualification search
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [qualificationSearch, setQualificationSearch] = useState('')

  // Errors & loading
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (isEdit) return
    if (nameSearchTimerRef.current) clearTimeout(nameSearchTimerRef.current)
    if (!nameSearch.trim()) { setNameResults([]); return }
    nameSearchTimerRef.current = setTimeout(() => {
      setNameSearchLoading(true)
      getDoctorsList({ search: nameSearch, limit: 10 })
        .then(res => { if (res.success) setNameResults(res.data) })
        .catch(() => {})
        .finally(() => setNameSearchLoading(false))
    }, 350)
    return () => { if (nameSearchTimerRef.current) clearTimeout(nameSearchTimerRef.current) }
  }, [nameSearch, isEdit])

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setFormErrors(p => ({ ...p, [key]: '' }))
  }

  const handleApiError = (err: unknown) => {
    const data = (err as ApiError)?.response?.data
    if (data?.errors?.length) {
      const mapped: Record<string, string> = {}
      const unmapped: string[] = []
      data.errors.forEach(e => {
        const key = FIELD_MAP[e.field]
        if (key) mapped[key] = e.message
        else unmapped.push(e.message)
      })
      if (Object.keys(mapped).length) setFormErrors(p => ({ ...p, ...mapped }))
      if (unmapped.length) setSubmitError(unmapped.join(', '))
      else if (!Object.keys(mapped).length) setSubmitError('Something went wrong. Please try again.')
    } else {
      setSubmitError(data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Full name is required'
    if (!form.medicalSystemId) errors.medicalSystemId = 'Medical system is required'
    if (selectedSpecialtyIds.length === 0) errors.specialty = 'At least one specialty is required'
    if (selectedQualificationIds.length === 0) errors.qualification = 'At least one qualification is required'
    if (!form.yearsOfExperience) errors.yearsOfExperience = 'Experience is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildFormData = (includeProfilePicture: boolean): FormData => {
    const fd = new FormData()
    if (form.name) fd.append('name', form.name)
    if (form.phoneNumber) fd.append('phoneNumber', form.phoneNumber)
    if (form.emailAddress) fd.append('emailAddress', form.emailAddress)
    if (form.about) fd.append('about', form.about)
    if (form.consultationFee) fd.append('consultationFee', form.consultationFee)
    if (form.yearsOfExperience) fd.append('yearsOfExperience', form.yearsOfExperience)
    if (form.advanceBookingLimit) fd.append('advanceBookingLimit', form.advanceBookingLimit)
    if (form.estimateConsultationTime) fd.append('estimateConsultationTime', form.estimateConsultationTime)
    if (form.medicalSystemId) fd.append('medicalSystemId', form.medicalSystemId)
    selectedSpecialtyIds.forEach(id => fd.append('specialtyIds', id))
    selectedQualificationIds.forEach(id => fd.append('qualificationIds', id))
    if (includeProfilePicture && avatarFileRef.current) fd.append('profilePicture', avatarFileRef.current)
    return fd
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setSubmitError(null)
    try {
      if (isEdit) {
        const body = avatarFileRef.current
          ? buildFormData(true)
          : {
              name: form.name || undefined,
              emailAddress: form.emailAddress || undefined,
              about: form.about || undefined,
              consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
              yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
              advanceBookingLimit: form.advanceBookingLimit ? Number(form.advanceBookingLimit) : undefined,
              estimateConsultationTime: form.estimateConsultationTime ? Number(form.estimateConsultationTime) : undefined,
              medicalSystemId: form.medicalSystemId || undefined,
              specialtyIds: selectedSpecialtyIds,
              qualificationIds: selectedQualificationIds,
            }
        const res = await updateDoctor(doctor!.id, body)
        if (res.success) onUpdated?.({ ...doctor!, ...res.data })
      } else {
        const body = avatarFileRef.current
          ? buildFormData(true)
          : {
              name: form.name,
              phoneNumber: form.phoneNumber,
              yearsOfExperience: Number(form.yearsOfExperience),
              medicalSystemId: form.medicalSystemId,
              qualificationIds: selectedQualificationIds,
              specialtyIds: selectedSpecialtyIds,
              ...(form.emailAddress && { emailAddress: form.emailAddress }),
              ...(form.about && { about: form.about }),
              ...(form.consultationFee && { consultationFee: Number(form.consultationFee) }),
              ...(form.advanceBookingLimit && { advanceBookingLimit: Number(form.advanceBookingLimit) }),
              ...(form.estimateConsultationTime && { estimateConsultationTime: Number(form.estimateConsultationTime) }),
            }
        const res = await createDoctor(body)
        if (res.success) { onCreated?.(res.data); setCreated(true) }
      }
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const isReadOnly = !!selectedDoctor

  // Chip input helper
  const ChipInput = ({
    ids, onRemove, search, onSearchChange, onSelect, allItems, errorKey, placeholder,
  }: {
    ids: string[]
    onRemove: (id: string) => void
    search: string
    onSearchChange: (v: string) => void
    onSelect: (id: string) => void
    allItems: { id: string; name: string }[]
    errorKey: string
    placeholder: string
  }) => {
    const filtered = allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) && !ids.includes(i.id))
    return (
      <>
        <div className={`doc-spec-input${isReadOnly ? ' doc-spec-input--disabled' : ''}${formErrors[errorKey] ? ' doc-spec-input--error' : ''}`}>
          {ids.map(id => {
            const item = allItems.find(x => x.id === id)
            return item ? (
              <span key={id} className="doc-spec-chip">
                {item.name}
                {!isReadOnly && (
                  <button type="button" className="doc-spec-chip-remove"
                    onMouseDown={e => { e.preventDefault(); onRemove(id); setFormErrors(p => ({ ...p, [errorKey]: '' })) }}>✕</button>
                )}
              </span>
            ) : null
          })}
          {!isReadOnly && (
            <input
              className="doc-spec-search"
              placeholder={ids.length === 0 ? placeholder : ''}
              value={search}
              onChange={e => { onSearchChange(e.target.value); if (formErrors[errorKey]) setFormErrors(p => ({ ...p, [errorKey]: '' })) }}
            />
          )}
        </div>
        {formErrors[errorKey] && <span className="doc-field-error">{formErrors[errorKey]}</span>}
        {search && !isReadOnly && (
          <ul className="doc-spec-dropdown">
            {filtered.length > 0 ? filtered.map(i => (
              <li key={i.id} className="doc-spec-dropdown-item"
                onMouseDown={e => { e.preventDefault(); onSelect(i.id); onSearchChange(''); setFormErrors(p => ({ ...p, [errorKey]: '' })) }}>
                {i.name}
              </li>
            )) : <li className="doc-spec-dropdown-empty">No results found</li>}
          </ul>
        )}
      </>
    )
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ width: 520 }}>
        {!isEdit && created ? (
          <div className="doc-success">
            <div className="doc-success-icon-wrap">
              <img src={smsIcon} alt="" style={{ width: 34, height: 34 }} />
            </div>
            <h2 className="doc-success-title">Doctor Added Successfully</h2>
            <p className="doc-success-desc">An invitation email has been sent.<br />The doctor must complete account setup by creating a password before accessing the portal.</p>
            <button className="ip-btn ip-submit" style={{ marginTop: 8 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="sch-header">
              <h2 className="sch-title">{isEdit ? 'Edit Doctor' : 'Add Doctor'}</h2>
              <button className="sch-close" onClick={onClose}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body">

                {/* Avatar */}
                <div className="doc-avatar-upload">
                  <div className="doc-avatar-wrap" onClick={() => !isReadOnly && fileInputRef.current?.click()}>
                    <img src={avatarPreview ?? avatarIcon} alt="upload" className="doc-avatar-circle" />
                    {!isReadOnly && (
                      <div className="doc-camera-btn" onClick={() => fileInputRef.current?.click()}>
                        <img src={cameraIcon} alt="camera" style={{ width: 18, height: 18 }} />
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) { avatarFileRef.current = f; setAvatarPreview(URL.createObjectURL(f)) } }} />
                </div>

                {/* Name (with doctor search in create mode) */}
                <div style={{ marginBottom: 18 }}>
                  <div className="form-field">
                    <label className="form-field-label">Full Name<span className="form-field-required"> *</span></label>
                    <div className="form-field-input-wrap" ref={nameInputRef}>
                      <input
                        className={`form-field-input${formErrors.name ? ' form-field-input--error' : ''}`}
                        placeholder={isEdit ? 'Full name' : 'Search doctor by name...'}
                        value={nameSearch}
                        readOnly={isEdit ? false : isReadOnly}
                        onChange={e => {
                          if (isEdit) {
                            setNameSearch(e.target.value)
                            setField('name')(e as React.ChangeEvent<HTMLInputElement>)
                          } else {
                            setNameSearch(e.target.value)
                            setForm(p => ({ ...p, name: e.target.value }))
                            if (selectedDoctor) setSelectedDoctor(null)
                            if (formErrors.name) setFormErrors(p => ({ ...p, name: '' }))
                          }
                        }}
                      />
                      {nameSearchLoading && <span className="doc-name-search-spinner" />}
                      {!isEdit && selectedDoctor && (
                        <button className="doc-name-clear-btn" onMouseDown={() => {
                          setSelectedDoctor(null)
                          setNameSearch('')
                          setForm({ name: '', phoneNumber: '', emailAddress: '', about: '', consultationFee: '', yearsOfExperience: '', advanceBookingLimit: '', estimateConsultationTime: '', medicalSystemId: '', specialtyIds: '' })
                          setSelectedSpecialtyIds([])
                          setSelectedQualificationIds([])
                          setAvatarPreview(null)
                          avatarFileRef.current = null
                          setFormErrors({})
                        }}>✕</button>
                      )}
                    </div>
                    {formErrors.name && <span className="doc-field-error">{formErrors.name}</span>}
                    {!isEdit && nameResults.length > 0 && nameInputRef.current && (() => {
                      const r = nameInputRef.current!.getBoundingClientRect()
                      return (
                        <ul className="doc-name-dropdown" style={{ top: r.bottom + 4, left: r.left, width: r.width }}>
                          {nameResults.map(d => (
                            <li key={d.id} className="doc-name-dropdown-item"
                              onMouseDown={() => {
                                setSelectedDoctor(d)
                                setNameSearch(d.name)
                                setNameResults([])
                                setAvatarPreview(d.profilePicture || null)
                                setForm({
                                  name: d.name,
                                  phoneNumber: d.phoneNumber,
                                  emailAddress: d.emailAddress,
                                  about: d.about,
                                  consultationFee: String(d.consultationFee),
                                  yearsOfExperience: String(d.yearsOfExperience),
                                  advanceBookingLimit: String(d.advanceBookingLimit),
                                  estimateConsultationTime: String(d.estimateConsultationTime),
                                  medicalSystemId: d.medicalSystem?.id ?? '',
                                  specialtyIds: '',
                                })
                                setSelectedSpecialtyIds(d.specialties.map(s => s.id))
                                setSelectedQualificationIds(d.qualifications.map(q => q.id))
                                setFormErrors({})
                              }}>
                              <img src={d.profilePicture || doctorProfileImg} alt={d.name} className="doc-name-dropdown-avatar" />
                              <div className="doc-name-dropdown-info">
                                <span className="doc-name-dropdown-name">{d.name}</span>
                                <span className="doc-name-dropdown-specialties">{d.specialties.map(s => s.name).join(', ') || '—'}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    })()}
                  </div>
                </div>

                {/* Medical System */}
                <div style={{ marginBottom: 18 }}>
                  <FormField as="select" label="Medical System" value={form.medicalSystemId}
                    error={formErrors.medicalSystemId}
                    disabled={isReadOnly}
                    onChange={e => { if (!isReadOnly) { setForm(p => ({ ...p, medicalSystemId: (e.target as HTMLSelectElement).value })); setFormErrors(p => ({ ...p, medicalSystemId: '' })) } }}
                    options={medicalSystems.map(m => ({ label: m.name, value: m.id }))} />
                </div>

                {/* Specialty */}
                <div style={{ marginBottom: 18 }}>
                  <div className="form-field">
                    <label className="form-field-label">Specialty <span className="form-field-required"> *</span></label>
                    <ChipInput
                      ids={selectedSpecialtyIds}
                      onRemove={id => setSelectedSpecialtyIds(p => p.filter(i => i !== id))}
                      search={specialtySearch}
                      onSearchChange={setSpecialtySearch}
                      onSelect={id => setSelectedSpecialtyIds(p => [...p, id])}
                      allItems={specialties}
                      errorKey="specialty"
                      placeholder="Search specialty..."
                    />
                  </div>
                </div>

                {/* Qualification */}
                <div style={{ marginBottom: 18 }}>
                  <div className="form-field">
                    <label className="form-field-label">Qualification <span className="form-field-required"> *</span></label>
                    <ChipInput
                      ids={selectedQualificationIds}
                      onRemove={id => setSelectedQualificationIds(p => p.filter(i => i !== id))}
                      search={qualificationSearch}
                      onSearchChange={setQualificationSearch}
                      onSelect={id => setSelectedQualificationIds(p => [...p, id])}
                      allItems={qualifications}
                      errorKey="qualification"
                      placeholder="Search qualification..."
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="sch-form-row">
                  <FormField label="Phone Number" placeholder="Enter phone" type="tel" prefix="+91"
                    value={form.phoneNumber} showRequired={false}
                    error={formErrors.phoneNumber}
                    readOnly={isReadOnly}
                    onChange={e => { if (!isReadOnly) { setForm(p => ({ ...p, phoneNumber: (e.target as HTMLInputElement).value })); setFormErrors(p => ({ ...p, phoneNumber: '' })) } }} />
                  <FormField label="Email" placeholder="Enter email" type="email"
                    value={form.emailAddress} showRequired={false}
                    error={formErrors.emailAddress}
                    readOnly={isReadOnly}
                    onChange={e => { if (!isReadOnly) { setForm(p => ({ ...p, emailAddress: (e.target as HTMLInputElement).value })); setFormErrors(p => ({ ...p, emailAddress: '' })) } }} />
                </div>

                {/* Experience + Avg Time */}
                <div className="sch-form-row">
                  <FormField label="Experience (years)" placeholder="e.g. 5" type="number" min={0}
                    value={form.yearsOfExperience} showRequired={false}
                    error={formErrors.yearsOfExperience}
                    readOnly={isReadOnly}
                    onChange={e => { if (!isReadOnly) { setForm(p => ({ ...p, yearsOfExperience: (e.target as HTMLInputElement).value })); setFormErrors(p => ({ ...p, yearsOfExperience: '' })) } }} />
                  <FormField label="Avg Time / Patient (min)" placeholder="e.g. 15" type="number" min={0}
                    value={form.estimateConsultationTime} showRequired={false}
                    readOnly={isReadOnly}
                    onChange={e => !isReadOnly && setForm(p => ({ ...p, estimateConsultationTime: (e.target as HTMLInputElement).value }))} />
                </div>

                {/* Fee + Booking Limit */}
                <div className="sch-form-row">
                  <FormField label="Consultation Fee" placeholder="e.g. 500" type="number" min={0}
                    value={form.consultationFee} showRequired={false}
                    readOnly={isReadOnly}
                    onChange={e => !isReadOnly && setForm(p => ({ ...p, consultationFee: (e.target as HTMLInputElement).value }))} />
                  <FormField label="Advance Booking Limit (days)" placeholder="e.g. 7" type="number" min={0}
                    value={form.advanceBookingLimit} showRequired={false}
                    readOnly={isReadOnly}
                    onChange={e => !isReadOnly && setForm(p => ({ ...p, advanceBookingLimit: (e.target as HTMLInputElement).value }))} />
                </div>

                {/* About */}
                <div style={{ marginBottom: 18 }}>
                  <label className="form-field-label">Biography / About</label>
                  <textarea className="doc-textarea" placeholder="Write a short bio..." rows={4} style={{ height: 92 }}
                    value={form.about}
                    readOnly={isReadOnly}
                    onChange={e => !isReadOnly && setForm(p => ({ ...p, about: e.target.value }))} />
                </div>

              </div>
            </div>
            <div className="sch-divider" />
            {submitError && <p className="doc-submit-error" style={{ margin: '0 24px' }}>{submitError}</p>}
            <div className="ip-actions" style={{ padding: '16px 24px' }}>
              <button className="ip-btn ip-cancel" onClick={onClose}>Cancel</button>
              <button className="ip-btn ip-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Doctor')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default DoctorFormModal
