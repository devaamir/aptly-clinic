import type { FC } from 'react'
import { useState, useRef } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import type { DoctorDetail } from '../services/types'
import { updateDoctorSchedule, updateDoctor } from '../services/api'
import { useAppContext } from '../context/AppContext'
import cameraIcon from '../assets/icons/camera-icon.svg'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import patientsGreenIcon from '../assets/icons/patients-green-icon.svg'
import patientsRedIcon from '../assets/icons/patients-red-icon.svg'
import clockBlueIcon from '../assets/icons/clock-blue-icon.svg'
import qualificationIcon from '../assets/icons/qualification-icon.svg'
import experienceIcon from '../assets/icons/experience-icon.svg'
import phoneIcon from '../assets/icons/phone-icon-grey.svg'
import emailIcon from '../assets/icons/email-icon.svg'
import buildingIcon from '../assets/icons/building-icon.svg'
import dollarIcon from '../assets/icons/dollar-icon.svg'
import './DoctorProfile.css'


const statusProps = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

interface DoctorProfileProps {
  doctor: DoctorDetail
  onBack: () => void
  onEdit?: (updated: DoctorDetail) => void
}

const DoctorProfile: FC<DoctorProfileProps> = ({ doctor, onBack, onEdit }) => {
  const { specialties, medicalSystems, qualifications } = useAppContext()
  const [activeTab, setActiveTab] = useState<'Overview' | 'Schedule' | 'Leaves' | 'Documents'>('Overview')
  const [showEditDoctor, setShowEditDoctor] = useState(false)
  const showEdit = showEditDoctor
  const [editForm, setEditForm] = useState({
    name: doctor.name ?? '',
    emailAddress: doctor.emailAddress ?? '',
    about: doctor.about ?? '',
    consultationFee: doctor.consultationFee?.toString() ?? '',
    yearsOfExperience: doctor.yearsOfExperience?.toString() ?? '',
    advanceBookingLimit: doctor.advanceBookingLimit?.toString() ?? '',
    estimateConsultationTime: doctor.estimateConsultationTime?.toString() ?? '',
    medicalSystemId: doctor.medicalSystem?.id ?? '',
  })
  const [editSpecialtyIds, setEditSpecialtyIds] = useState<string[]>(doctor.specialties.map(s => s.id))
  const [editQualificationIds, setEditQualificationIds] = useState<string[]>(doctor.qualifications.map(q => q.id))
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  const setEdit = (key: keyof typeof editForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditForm(f => ({ ...f, [key]: e.target.value }))

  const handleSaveEdit = async () => {
    setEditLoading(true)
    setEditError('')
    try {
      let body: import('../services/types').UpdateDoctorRequest | FormData
      if (editAvatarFile) {
        const fd = new FormData()
        if (editForm.name) fd.append('name', editForm.name)
        if (editForm.emailAddress) fd.append('emailAddress', editForm.emailAddress)
        if (editForm.about) fd.append('about', editForm.about)
        if (editForm.consultationFee) fd.append('consultationFee', editForm.consultationFee)
        if (editForm.yearsOfExperience) fd.append('yearsOfExperience', editForm.yearsOfExperience)
        if (editForm.advanceBookingLimit) fd.append('advanceBookingLimit', editForm.advanceBookingLimit)
        if (editForm.estimateConsultationTime) fd.append('estimateConsultationTime', editForm.estimateConsultationTime)
        if (editForm.medicalSystemId) fd.append('medicalSystemId', editForm.medicalSystemId)
        editSpecialtyIds.forEach(id => fd.append('specialtyIds', id))
        editQualificationIds.forEach(id => fd.append('qualificationIds', id))
        fd.append('profilePicture', editAvatarFile)
        body = fd
      } else {
        body = {
          name: editForm.name || undefined,
          emailAddress: editForm.emailAddress || undefined,
          about: editForm.about || undefined,
          consultationFee: editForm.consultationFee ? Number(editForm.consultationFee) : undefined,
          yearsOfExperience: editForm.yearsOfExperience ? Number(editForm.yearsOfExperience) : undefined,
          advanceBookingLimit: editForm.advanceBookingLimit ? Number(editForm.advanceBookingLimit) : undefined,
          estimateConsultationTime: editForm.estimateConsultationTime ? Number(editForm.estimateConsultationTime) : undefined,
          medicalSystemId: editForm.medicalSystemId || undefined,
          specialtyIds: editSpecialtyIds,
          qualificationIds: editQualificationIds,
        }
      }
      const res = await updateDoctor(doctor.id, body)
      if (res.success) {
        onEdit?.({ ...doctor, ...res.data })
        setShowEditDoctor(false)
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update doctor.')
    } finally {
      setEditLoading(false)
    }
  }

  const to12Hour = (time: string) => {
    const [h, m] = time.slice(0, 5).split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const allSchedules = doctor.medicalCenters.flatMap(mc => mc.schedules)

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const weekSchedule = DAYS.map(day => {
    const sessions = allSchedules.filter(s => s.dayOfWeek.toLowerCase() === day.toLowerCase())
    return { day, short: day.slice(0, 3), sessions }
  })

  const [showModify, setShowModify] = useState(false)

  type ShiftRow = { id?: string; startTime: string; stopTime: string; tokenLimit: number }
  const initShifts = () => Object.fromEntries(
    DAYS.map(day => [day, allSchedules
      .filter(s => s.dayOfWeek.toLowerCase() === day.toLowerCase())
      .map(s => ({ id: s.id, startTime: s.startTime.slice(0, 5), stopTime: s.stopTime.slice(0, 5), tokenLimit: s.tokenLimit }))
    ])
  )
  const [dayToggles, setDayToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(weekSchedule.map(d => [d.day, d.sessions.length > 0]))
  )
  const [dayShifts, setDayShifts] = useState<Record<string, ShiftRow[]>>(initShifts)
  const [saveLoading, setSaveLoading] = useState(false)

  const addShift = (day: string) =>
    setDayShifts(p => ({ ...p, [day]: [...p[day], { startTime: '09:00', stopTime: '17:00', tokenLimit: 20 }] }))

  const removeShift = (day: string, idx: number) =>
    setDayShifts(p => ({ ...p, [day]: p[day].filter((_, i) => i !== idx) }))

  const updateShift = (day: string, idx: number, field: keyof ShiftRow, value: string | number) =>
    setDayShifts(p => ({ ...p, [day]: p[day].map((s, i) => i === idx ? { ...s, [field]: value } : s) }))

  const handleSaveSchedule = async () => {
    const originalIds = new Set(allSchedules.map(s => s.id))
    const toAdd: { dayOfWeek: string; startTime: string; stopTime: string; tokenLimit: number }[] = []
    const toUpdate: { id: string; startTime: string; stopTime: string; tokenLimit: number }[] = []
    const keptIds = new Set<string>()

    DAYS.forEach(day => {
      if (!dayToggles[day]) return
      dayShifts[day].forEach(s => {
        const startTime = s.startTime + ':00'
        const stopTime = s.stopTime + ':00'
        if (s.id) {
          keptIds.add(s.id)
          toUpdate.push({ id: s.id, startTime, stopTime, tokenLimit: s.tokenLimit })
        } else {
          toAdd.push({ dayOfWeek: day.toLowerCase(), startTime, stopTime, tokenLimit: s.tokenLimit })
        }
      })
    })

    const toRemove = [...originalIds].filter(id => !keptIds.has(id))

    setSaveLoading(true)
    try {
      const response = await updateDoctorSchedule(doctor.id, { toAdd, toUpdate, toRemove, force: false })
      if (response.success) {
        doctor.medicalCenters[0].schedules = response.data
        setDayShifts(initShifts())
        setShowModify(false)
      }
    } catch { /* silent */ } finally { setSaveLoading(false) }
  }

  return (
    <div className="dp-container">
      <div className="dp-body">
        {/* Profile Card */}
        <div className="dp-profile-card">
          <img src={doctor.profilePicture || doctorProfileImg} alt={doctor.name} className="dp-avatar" />
          <div className="dp-profile-info">
            <div className="dp-name-row">
              <span className="dp-name">{doctor.name}</span>
              <Badge text="Active" {...statusProps['Active']} />
              <button className="dp-edit-btn" onClick={() => setShowEditDoctor(true)}>Edit Doctor</button>
            </div>
            <span className="dp-specialty">{doctor.specialties[0]?.name ?? ''}</span>
            <div className="dp-info-row">
              {[
                { icon: qualificationIcon, value: doctor.qualifications.map(q => q.name).join(', ') || '—' },
                { icon: experienceIcon, value: `${doctor.yearsOfExperience} yrs` },
                { icon: phoneIcon, value: doctor.phoneNumber },
              ].map((item, i) => (
                <div key={i} className="dp-info-item">
                  <img src={item.icon} alt="" />
                  <span className="dp-info-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="dp-info-row">
              {[
                { icon: emailIcon, value: doctor.emailAddress },
                { icon: buildingIcon, value: doctor.medicalSystem?.name ?? '—' },
                { icon: dollarIcon, value: doctor.consultationFee ? `₹${doctor.consultationFee}` : '—' },
              ].map((item, i) => (
                <div key={i} className="dp-info-item">
                  <img src={item.icon} alt="" />
                  <span className="dp-info-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="dp-meta-text">
              Doctor ID: {doctor.referenceId} &bull; Joined {new Date(doctor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dp-tabs">
          {(['Overview', 'Schedule', 'Leaves', 'Documents'] as const).map(tab => (
            <button key={tab} className={`dp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <div className="dp-overview">
            {/* Left 70% */}
            <div className="dp-overview-left">
              <div className="dp-stats-row">
                {[
                  { label: 'Monthly Patients', value: '124', icon: patientsGreenIcon },
                  { label: 'Total Patients', value: '1,840', icon: patientsRedIcon },
                  { label: 'Avg Time / Patient', value: `${doctor.estimateConsultationTime} min`, icon: clockBlueIcon },
                ].map(s => (
                  <div key={s.label} className="dp-stat-card">
                    <img src={s.icon} alt="" style={{ width: 20, height: 20, marginBottom: 8 }} />
                    <span className="dp-stat-value">{s.value}</span>
                    <span className="dp-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 30% */}
            <div className="dp-overview-right">
              <div className="dp-schedule-card">
                <div className="dp-schedule-title">This Week's Schedule</div>
                {weekSchedule.map((item) => (
                  <div key={item.short}>
                    <div className={`dp-schedule-row ${item.sessions.length === 0 ? 'dp-schedule-row-off' : ''}`}>
                      <span className="dp-schedule-day">{item.short}</span>
                      <div className="dp-schedule-sessions">
                        {item.sessions.length === 0
                          ? <span className="dp-schedule-off">Off</span>
                          : item.sessions.map(s => <span key={s.id} className="dp-schedule-session">{to12Hour(s.startTime)} – {to12Hour(s.stopTime)}</span>)
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Schedule' && (
          <div className="dp-schedule-tab">
            <div className="dp-schedule-tab-header">
              <span className="dp-schedule-tab-title">This Week's Schedule</span>
              <button className="dp-modify-btn" onClick={() => setShowModify(true)}>Modify Schedule</button>
            </div>
            <div className="dp-week-grid">
              {weekSchedule.map(item => (
                <div key={item.day} className="dp-day-card">
                  <div className="dp-day-card-header">
                    <span className="dp-day-card-name">{item.day}</span>
                    <span className={`dp-day-badge ${item.sessions.length === 0 ? 'off' : ''}`}>
                      {item.sessions.length === 0 ? 'Off Day' : 'Working Day'}
                    </span>
                  </div>
                  {item.sessions.length > 0 && (
                    <div className="dp-day-sessions">
                      {item.sessions.map(s => (
                        <div key={s.id} className="dp-session-card">
                          <span className="dp-session-time">{to12Hour(s.startTime)} – {to12Hour(s.stopTime)}</span>
                          <div className="dp-session-meta">
                            <span>Max {s.tokenLimit} Tokens</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'Leaves' && (
          <div className="dp-schedule-tab">
            <div className="dp-schedule-tab-header">
              <span className="dp-schedule-tab-title">Leave History</span>
            </div>
            <table className="dp-table">
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>APPLIED DATE</th>
                  <th>REASON</th>
                  <th>START DATE</th>
                  <th>END DATE</th>
                  <th>DURATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { applied: 'Mar 10, 2026', reason: 'Medical', start: 'Mar 15, 2026', end: 'Mar 17, 2026', duration: '3 days', status: 'Approved' },
                  { applied: 'Feb 20, 2026', reason: 'Personal', start: 'Feb 25, 2026', end: 'Feb 25, 2026', duration: '1 day', status: 'Approved' },
                  { applied: 'Jan 5, 2026', reason: 'Family Emergency', start: 'Jan 8, 2026', end: 'Jan 10, 2026', duration: '3 days', status: 'Rejected' },
                ].map((l, i) => (
                  <tr key={i}>
                    <td>{l.applied}</td>
                    <td>{l.reason}</td>
                    <td>{l.start}</td>
                    <td>{l.end}</td>
                    <td>{l.duration}</td>
                    <td>
                      <span className={`dp-leave-status ${l.status === 'Approved' ? 'approved' : 'rejected'}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'Documents' && <div className="dp-tab-placeholder">Documents content coming soon.</div>}
      </div>

      {showEdit && (
        <Modal onClose={() => setShowEditDoctor(false)}>
          <div style={{ width: 520 }}>
            <div className="sch-header">
              <h2 className="sch-title">Edit Doctor</h2>
              <button className="sch-close" onClick={() => setShowEditDoctor(false)}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body">
                {editError && <div style={{ color: '#F04438', background: '#FEF3F2', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{editError}</div>}
                <div className="doc-avatar-upload" style={{ marginBottom: 24 }}>
                  <div className="doc-avatar-wrap" onClick={() => editFileRef.current?.click()}>
                    <img src={editAvatarPreview ?? doctor.profilePicture ?? doctorProfileImg} alt="" className="doc-avatar-circle" />
                    <div className="doc-camera-btn">
                      <img src={cameraIcon} alt="camera" style={{ width: 18, height: 18 }} />
                    </div>
                  </div>
                  <input ref={editFileRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) { setEditAvatarFile(f); setEditAvatarPreview(URL.createObjectURL(f)) } }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <FormField label="Full Name" value={editForm.name} onChange={setEdit('name')} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <FormField label="Email" type="email" value={editForm.emailAddress} onChange={setEdit('emailAddress')} showRequired={false} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <FormField as="select" label="Medical System" value={editForm.medicalSystemId} onChange={setEdit('medicalSystemId')}
                    options={medicalSystems.map(m => ({ label: m.name, value: m.id }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <FormField as="select" label="Specialty" value={editSpecialtyIds[0] ?? ''} onChange={e => setEditSpecialtyIds([(e.target as HTMLSelectElement).value])}
                    options={specialties.map(s => ({ label: s.name, value: s.id }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div className="form-field">
                    <label className="form-field-label">Qualification <span className="form-field-required"> *</span></label>
                    <select multiple className="form-field-input" style={{ height: 96 }}
                      value={editQualificationIds}
                      onChange={e => setEditQualificationIds(Array.from(e.target.selectedOptions, o => o.value))}>
                      {qualifications.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="sch-form-row">
                  <FormField label="Experience (years)" type="number" min={0} value={editForm.yearsOfExperience} onChange={setEdit('yearsOfExperience')} showRequired={false} />
                  <FormField label="Avg Time / Patient (min)" type="number" min={0} value={editForm.estimateConsultationTime} onChange={setEdit('estimateConsultationTime')} showRequired={false} />
                </div>
                <div className="sch-form-row">
                  <FormField label="Consultation Fee" type="number" min={0} value={editForm.consultationFee} onChange={setEdit('consultationFee')} showRequired={false} />
                  <FormField label="Advance Booking Limit (days)" type="number" min={0} value={editForm.advanceBookingLimit} onChange={setEdit('advanceBookingLimit')} showRequired={false} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="form-field-label">About</label>
                  <textarea className="doc-textarea" rows={4} style={{ height: 92 }} value={editForm.about} onChange={e => setEditForm(f => ({ ...f, about: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="sch-divider" />
            <div className="ip-actions" style={{ padding: '16px 24px' }}>
              <button className="ip-btn ip-cancel" onClick={() => setShowEditDoctor(false)}>Cancel</button>
              <button className="ip-btn ip-submit" onClick={handleSaveEdit} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </Modal>
      )}

      {showModify && (
        <Modal onClose={() => setShowModify(false)}>
          <div style={{ width: 520 }}>
            <div className="sch-header">
              <h2 className="sch-title">Modify Schedule</h2>
              <button className="sch-close" onClick={() => setShowModify(false)}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body">
                {weekSchedule.map(item => (
                  <div key={item.day} className="dp-modify-day-row">
                    <div className="dp-modify-day-left">
                      <button
                        className={`dp-toggle ${dayToggles[item.day] ? 'on' : ''}`}
                        onClick={() => setDayToggles(p => ({ ...p, [item.day]: !p[item.day] }))}
                      ><span className="dp-toggle-thumb" /></button>
                      <div className="dp-modify-day-name">{item.day}</div>
                      {dayToggles[item.day] && (
                        <button className="dp-add-shift-btn" onClick={() => addShift(item.day)}>+ Add Shift</button>
                      )}
                    </div>
                    {dayToggles[item.day] && dayShifts[item.day].length > 0 && (
                      <div className="dp-modify-sessions">
                        {dayShifts[item.day].map((s, si) => (
                          <div key={si} className="dp-modify-session-item">
                            <div className="dp-modify-inputs">
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">Start Time</label>
                                <input type="time" className="dp-modify-input" value={s.startTime} onChange={e => updateShift(item.day, si, 'startTime', e.target.value)} />
                              </div>
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">End Time</label>
                                <input type="time" className="dp-modify-input" value={s.stopTime} onChange={e => updateShift(item.day, si, 'stopTime', e.target.value)} />
                              </div>
                              <div className="dp-modify-input-group">
                                <label className="dp-modify-input-label">Max Tokens</label>
                                <input type="number" className="dp-modify-input" value={s.tokenLimit} min={1} onChange={e => updateShift(item.day, si, 'tokenLimit', Number(e.target.value))} />
                              </div>
                              <button className="dp-remove-shift-btn" onClick={() => removeShift(item.day, si)}>✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="sch-divider" />
            <div className="ip-actions" style={{ padding: '16px 24px' }}>
              <button className="ip-btn ip-cancel" onClick={() => setShowModify(false)}>Cancel</button>
              <button className="ip-btn ip-submit" onClick={handleSaveSchedule} disabled={saveLoading}>{saveLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default DoctorProfile
