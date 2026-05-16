import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import { getDoctors, createDoctor, getDoctor, deleteDoctor, getDoctorsList } from '../services/api'
import type { AppointmentDoctor, DoctorDetail, DoctorListItem } from '../services/types'
import { useAppContext } from '../context/AppContext'
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
import doctorProfileImg from '../assets/images/doctor-profile.png'
import './Doctors.css'

interface Doctor {
  id: string
  doctorUuid: string
  name: string
  avatar: string
  specialty: string
  phone: string
  email: string
  experience: string
  status: 'Active' | 'Inactive'
}

const mapDoctor = (d: AppointmentDoctor): Doctor => ({
  id: d.referenceId,
  doctorUuid: d.id,
  name: d.name,
  avatar: d.profilePicture || doctorProfileImg,
  specialty: d.specialties[0]?.name ?? '',
  phone: d.phoneNumber,
  email: d.emailAddress,
  experience: `${d.yearsOfExperience} yrs`,
  status: 'Active',
})

const statusProps = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

const Doctors: FC<{ onViewProfile: (d: DoctorDetail) => void }> = ({ onViewProfile }) => {
  const { activeContext, specialties, medicalSystems, qualifications } = useAppContext()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [doctorAdded, setDoctorAdded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarFileRef = useRef<File | null>(null)
  const [form, setForm] = useState({ name: '', phoneNumber: '', emailAddress: '', about: '', consultationFee: '', yearsOfExperience: '', advanceBookingLimit: '', estimateConsultationTime: '', medicalSystemId: '', specialtyIds: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([])
  const [selectedQualificationIds, setSelectedQualificationIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [nameSearch, setNameSearch] = useState('')
  const [nameResults, setNameResults] = useState<DoctorListItem[]>([])
  const [nameSearchLoading, setNameSearchLoading] = useState(false)
  const nameSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameInputRef = useRef<HTMLDivElement>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListItem | null>(null)

  const resetForm = () => {
    setForm({ name: '', phoneNumber: '', emailAddress: '', about: '', consultationFee: '', yearsOfExperience: '', advanceBookingLimit: '', estimateConsultationTime: '', medicalSystemId: '', specialtyIds: '' })
    setSelectedSpecialtyIds([])
    setSelectedQualificationIds([])
    setNameSearch('')
    setNameResults([])
    setSelectedDoctor(null)
    setAvatarPreview(null)
    avatarFileRef.current = null
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteDoctor(deleteTarget.doctorUuid, activeContext!.medicalCenter.id)
      setDoctors(prev => prev.filter(d => d.doctorUuid !== deleteTarget.doctorUuid))
      setDeleteTarget(null)
    } catch { /* silent */ } finally { setDeleteLoading(false) }
  }

  const handleAddDoctor = async () => {
    if (!form.name || !form.phoneNumber || !form.yearsOfExperience || !form.medicalSystemId || !selectedQualificationIds.length || selectedSpecialtyIds.length === 0) return
    setAddLoading(true)
    try {
      const file = avatarFileRef.current
      let body: import('../services/types').CreateDoctorRequest | FormData
      if (file) {
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('phoneNumber', form.phoneNumber)
        fd.append('yearsOfExperience', form.yearsOfExperience)
        fd.append('medicalSystemId', form.medicalSystemId)
        selectedQualificationIds.forEach(id => fd.append('qualificationIds', id))
        selectedSpecialtyIds.forEach(id => fd.append('specialtyIds', id))
        if (form.emailAddress) fd.append('emailAddress', form.emailAddress)
        if (form.about) fd.append('about', form.about)
        if (form.consultationFee) fd.append('consultationFee', form.consultationFee)
        if (form.advanceBookingLimit) fd.append('advanceBookingLimit', form.advanceBookingLimit)
        if (form.estimateConsultationTime) fd.append('estimateConsultationTime', form.estimateConsultationTime)
        fd.append('profilePicture', file)
        body = fd
      } else {
        body = {
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
      }
      const res = await createDoctor(body)
      if (res.success) {
        setDoctors(prev => [mapDoctor(res.data), ...prev])
        setDoctorAdded(true)
      }
    } catch { /* error handled silently */ } finally { setAddLoading(false) }
  }

  useEffect(() => {
    setLoading(true)
    getDoctors().then(res => {
      if (res.success) setDoctors(res.data.map(mapDoctor))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [activeContext?.medicalCenter.id])

  useEffect(() => {
    if (nameSearchRef.current) clearTimeout(nameSearchRef.current)
    if (!nameSearch.trim()) { setNameResults([]); return }
    nameSearchRef.current = setTimeout(() => {
      setNameSearchLoading(true)
      getDoctorsList({ search: nameSearch, limit: 10 })
        .then(res => { if (res.success) setNameResults(res.data) })
        .catch(() => {})
        .finally(() => setNameSearchLoading(false))
    }, 350)
    return () => { if (nameSearchRef.current) clearTimeout(nameSearchRef.current) }
  }, [nameSearch])

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
        {loading ? (
          <div className="apt-loader-wrap"><div className="apt-loader" /></div>
        ) : (
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
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="doc-view-btn" onClick={() => getDoctor(d.doctorUuid).then(r => { if (r.success) onViewProfile(r.data) }).catch(() => {})}>View Profile</button>
                    <button className="doc-delete-btn" onClick={() => setDeleteTarget(d)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
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
                <button className="ip-btn ip-submit" style={{ marginTop: 8 }} onClick={() => { setShowAdd(false); setDoctorAdded(false); setAvatarPreview(null); resetForm(); setToast('Doctor added successfully') }}>Done</button>
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
                      <div className="doc-avatar-wrap" onClick={() => !selectedDoctor && fileInputRef.current?.click()}>
                        <img src={avatarPreview ?? avatarIcon} alt="upload" className="doc-avatar-circle" />
                        {!selectedDoctor && (
                          <div className="doc-camera-btn" onClick={() => fileInputRef.current?.click()}>
                            <img src={cameraIcon} alt="camera" style={{ width: 18, height: 18 }} />
                          </div>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => { const file = e.target.files?.[0]; if (file) { avatarFileRef.current = file; setAvatarPreview(URL.createObjectURL(file)) } }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <div className="form-field">
                        <label className="form-field-label">Full Name<span className="form-field-required"> *</span></label>
                        <div className="form-field-input-wrap" ref={nameInputRef}>
                          <input
                            className="form-field-input"
                            placeholder="Search doctor by name..."
                            value={nameSearch}
                            onChange={e => {
                              setNameSearch(e.target.value)
                              setForm(p => ({ ...p, name: e.target.value }))
                              if (selectedDoctor) setSelectedDoctor(null)
                            }}
                          />
                          {nameSearchLoading && <span className="doc-name-search-spinner" />}
                          {selectedDoctor && (
                            <button className="doc-name-clear-btn" onMouseDown={() => resetForm()}>✕</button>
                          )}
                        </div>
                        {nameResults.length > 0 && nameInputRef.current && (() => {
                          const r = nameInputRef.current.getBoundingClientRect()
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
                    <div style={{ marginBottom: 18 }}>
                      <FormField as="select" label="Medical System" value={form.medicalSystemId}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, medicalSystemId: (e.target as HTMLSelectElement).value }))}
                        options={medicalSystems.map(m => ({ label: m.name, value: m.id }))}
                        disabled={!!selectedDoctor} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <div className="form-field">
                        <label className="form-field-label">Specialty <span className="form-field-required"> *</span></label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                          {specialties.map(s => (
                            <button key={s.id} type="button"
                              disabled={!!selectedDoctor}
                              onClick={() => !selectedDoctor && setSelectedSpecialtyIds(prev =>
                                prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                              )}
                              style={{
                                padding: '4px 12px', borderRadius: 20, fontSize: 13, cursor: selectedDoctor ? 'default' : 'pointer',
                                border: `1px solid ${selectedSpecialtyIds.includes(s.id) ? '#418EFD' : '#E0E2E6'}`,
                                background: selectedSpecialtyIds.includes(s.id) ? '#418EFD' : '#fff',
                                color: selectedSpecialtyIds.includes(s.id) ? '#fff' : '#1C1E22',
                              }}>
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <div className="form-field">
                        <label className="form-field-label">Qualification <span className="form-field-required"> *</span></label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                          {qualifications.map(q => (
                            <button key={q.id} type="button"
                              disabled={!!selectedDoctor}
                              onClick={() => !selectedDoctor && setSelectedQualificationIds(prev =>
                                prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
                              )}
                              style={{
                                padding: '4px 12px', borderRadius: 20, fontSize: 13, cursor: selectedDoctor ? 'default' : 'pointer',
                                border: `1px solid ${selectedQualificationIds.includes(q.id) ? '#418EFD' : '#E0E2E6'}`,
                                background: selectedQualificationIds.includes(q.id) ? '#418EFD' : '#fff',
                                color: selectedQualificationIds.includes(q.id) ? '#fff' : '#1C1E22',
                              }}>
                              {q.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="sch-form-row">
                      <FormField label="Phone Number" placeholder="Enter phone" type="tel" prefix="+91" value={form.phoneNumber}
                        readOnly={!!selectedDoctor}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, phoneNumber: (e.target as HTMLInputElement).value }))} />
                      <FormField label="Email" placeholder="Enter email" type="email" value={form.emailAddress}
                        readOnly={!!selectedDoctor}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, emailAddress: (e.target as HTMLInputElement).value }))} />
                    </div>
                    <div className="sch-form-row">
                      <FormField label="Experience (years)" placeholder="e.g. 5" type="number" min={0} value={form.yearsOfExperience} showRequired={false}
                        readOnly={!!selectedDoctor}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, yearsOfExperience: (e.target as HTMLInputElement).value }))} />
                      <FormField label="Avg Time / Patient (min)" placeholder="e.g. 15" type="number" min={0} value={form.estimateConsultationTime} showRequired={false}
                        readOnly={!!selectedDoctor}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, estimateConsultationTime: (e.target as HTMLInputElement).value }))} />
                    </div>
                    <div className="sch-form-row">
                      <FormField label="Consultation Fee" placeholder="e.g. 500" type="number" min={0} value={form.consultationFee} showRequired={false}
                        readOnly={!!selectedDoctor}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, consultationFee: (e.target as HTMLInputElement).value }))} />
                      <FormField label="Advance Booking Limit (days)" placeholder="e.g. 7" type="number" min={0} value={form.advanceBookingLimit} showRequired={false}
                        readOnly={!!selectedDoctor}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, advanceBookingLimit: (e.target as HTMLInputElement).value }))} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label className="form-field-label">Biography / About</label>
                      <textarea className="doc-textarea" placeholder="Write a short bio..." rows={4} style={{ height: 92 }} value={form.about}
                        readOnly={!!selectedDoctor}
                        onChange={e => !selectedDoctor && setForm(p => ({ ...p, about: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="sch-divider" />
                <div className="ip-actions" style={{ padding: '16px 24px' }}>
                  <button className="ip-btn ip-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="ip-btn ip-submit" onClick={handleAddDoctor} disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Doctor'}</button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} icon={<img src={verifyTickGreen} alt="" />} />}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ width: 380, padding: 24, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Manrope' }}>Delete Doctor</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#636A79', fontFamily: 'Manrope' }}>
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from this clinic? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button className="ip-btn ip-submit" style={{ flex: 1, background: '#F04438' }} onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Doctors
