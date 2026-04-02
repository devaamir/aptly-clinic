import type { FC } from 'react'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import addIcon from '../assets/icons/add-icon-white.svg'
import calendarIcon from '../assets/icons/calendar.svg'
import tickBlue from '../assets/icons/tick-icon.svg'
import warningIcon from '../assets/icons/warning-red.svg'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import './LeaveManagement.css'

type LeaveStatus = 'Approved' | 'Rejected'
type Filter = 'All' | 'Approved' | 'Rejected'

interface Leave {
  id: string
  doctor: string
  avatar: string
  specialty: string
  appliedDate: string
  reason: string
  startDate: string
  endDate: string
  duration: string
  status: LeaveStatus
}

const statusProps: Record<LeaveStatus, { bgColor: string; textColor: string; dotColor: string }> = {
  Approved: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Rejected: { bgColor: '#FEF3F2', textColor: '#B42318', dotColor: '#F04438' },
}

const leaves: Leave[] = [
  { id: 'LV001', doctor: 'Dr. Daniel Hamilton', avatar: 'https://i.pravatar.cc/32?img=2', specialty: 'Cardiology', appliedDate: 'Mar 10, 2026', reason: 'Medical', startDate: 'Mar 15, 2026', endDate: 'Mar 17, 2026', duration: '3 days', status: 'Approved' },
  { id: 'LV002', doctor: 'Dr. Sarah Johnson', avatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', appliedDate: 'Mar 18, 2026', reason: 'Personal', startDate: 'Mar 22, 2026', endDate: 'Mar 22, 2026', duration: '1 day', status: 'Approved' },
  { id: 'LV003', doctor: 'Dr. Michael Chen', avatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', appliedDate: 'Mar 20, 2026', reason: 'Family Emergency', startDate: 'Mar 25, 2026', endDate: 'Mar 27, 2026', duration: '3 days', status: 'Rejected' },
  { id: 'LV004', doctor: 'Dr. Mark Spencer', avatar: 'https://i.pravatar.cc/32?img=3', specialty: 'Neurology', appliedDate: 'Mar 25, 2026', reason: 'Conference', startDate: 'Apr 1, 2026', endDate: 'Apr 3, 2026', duration: '3 days', status: 'Approved' },
  { id: 'LV005', doctor: 'Dr. Emily Carter', avatar: 'https://i.pravatar.cc/32?img=11', specialty: 'Pediatrics', appliedDate: 'Mar 28, 2026', reason: 'Vacation', startDate: 'Apr 5, 2026', endDate: 'Apr 8, 2026', duration: '4 days', status: 'Approved' },
]

const doctorsBySpecialty: Record<string, { label: string; value: string; sessions: string[] }[]> = {
  cardiology: [
    { label: 'Dr. Daniel Hamilton', value: 'daniel', sessions: ['9:00 AM – 1:00 PM', '2:00 PM – 4:00 PM'] },
    { label: 'Dr. Sarah Johnson', value: 'sarah', sessions: ['9:00 AM – 1:00 PM'] },
  ],
  neurology: [{ label: 'Dr. Mark Spencer', value: 'mark', sessions: ['9:00 AM – 1:00 PM'] }],
  orthopedics: [{ label: 'Dr. Michael Chen', value: 'michael', sessions: ['9:00 AM – 1:00 PM', '2:00 PM – 4:00 PM'] }],
  pediatrics: [{ label: 'Dr. Emily Carter', value: 'emily', sessions: ['9:00 AM – 1:00 PM', '2:00 PM – 4:00 PM'] }],
}

const LeaveManagement: FC = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [showApply, setShowApply] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [specialty, setSpecialty] = useState('')
  const [doctor, setDoctor] = useState('')
  const todayStr = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(todayStr)
  const [halfDay, setHalfDay] = useState(false)
  const [session, setSession] = useState('')

  const isHalfDayEligible = startDate && endDate && startDate === endDate
  const selectedDoctorSessions = doctorsBySpecialty[specialty]?.find(d => d.value === doctor)?.sessions ?? []

  const resetForm = () => { setShowApply(false); setSpecialty(''); setDoctor(''); setStartDate(todayStr); setEndDate(todayStr); setHalfDay(false); setSession('') }

  const filtered = leaves.filter(l =>
    (filter === 'All' || l.status === filter) &&
    (!search.trim() || l.doctor.toLowerCase().includes(search.toLowerCase()) || l.reason.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="lm-container">
      <PageHeader title="Leave Management" actions={
        <button className="lm-apply-btn" onClick={() => setShowApply(true)}>
          <img src={addIcon} alt="" style={{ width: 16, height: 16 }} />
          Apply Leave
        </button>
      } />

      <div className="lm-toolbar-card">
        <div className="lm-search">
          <InputBox
            type="text"
            placeholder="Search doctor or reason..."
            leftIcon={<img src={searchIcon} alt="" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            rightIcon={search ? <span className="lm-clear" onClick={() => setSearch('')}>✕</span> : undefined}
          />
        </div>
        <div className="lm-toolbar-right">
          <div className="lm-filter-group">
            {(['All', 'Approved', 'Rejected'] as Filter[]).map(f => (
              <button key={f} className={`lm-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <button className="lm-icon-btn"><img src={sortIcon} alt="sort" /></button>
          <button className="lm-icon-btn"><img src={reloadIcon} alt="reload" /></button>
        </div>
      </div>

      <div className="lm-main-card">
        <table className="lm-table">
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '5%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>APPLIED DATE</th>
              <th>DOCTOR</th>
              <th>START DATE</th>
              <th>END DATE</th>
              <th>DURATION</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="lm-empty">No leave requests found</td></tr>
            ) : filtered.map(l => (
              <tr key={l.id}>
                <td className="lm-cell">{l.appliedDate}</td>
                <td>
                  <div className="lm-doctor-cell">
                    <img src={l.avatar} alt={l.doctor} className="lm-avatar" />
                    <div>
                      <div className="lm-doctor-name">{l.doctor}</div>
                      <div className="lm-doctor-spec">{l.specialty}</div>
                    </div>
                  </div>
                </td>
                <td className="lm-cell">{l.startDate}</td>
                <td className="lm-cell">{l.endDate}</td>
                <td className="lm-cell">{l.duration}</td>
                <td><Badge text={l.status} {...statusProps[l.status]} /></td>
                <td>
                  {l.status !== 'Rejected' && new Date(l.startDate) > new Date() && (
                    <button className="lm-cancel-btn" onClick={() => setShowCancel(true)}>Cancel Leave</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCancel && (
        <Modal onClose={() => setShowCancel(false)}>
          <div className="lm-confirm-modal">
            <div className="lm-confirm-icon-wrap">
              <img src={warningIcon} alt="" style={{ width: 74, height: 74, filter: 'invert(65%) sepia(80%) saturate(600%) hue-rotate(5deg) brightness(105%)' }} />
            </div>
            <h3 className="lm-confirm-title">Cancel Approved Leave</h3>
            <p className="lm-confirm-desc">Are you sure you want to cancel this approved leave? This action will update your leave status and notify the relevant parties.</p>
            <div className="lm-confirm-actions">
              <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => setShowCancel(false)}>Keep Leave</button>
              <button className="ip-btn ip-submit" style={{ flex: 1, background: '#FF5A4F' }} onClick={() => setShowCancel(false)}>Cancel Leave</button>
            </div>
          </div>
        </Modal>
      )}

      {showApply && (
        <Modal onClose={resetForm}>
          <div style={{ width: 520 }}>
            <div className="sch-header">
              <h2 className="sch-title">Apply Leave</h2>
              <button className="sch-close" onClick={resetForm}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body">
                <div className="sch-form-row">
                  <FormField as="select" label="Specialty" value={specialty}
                    onChange={e => { setSpecialty((e.target as HTMLSelectElement).value); setDoctor(''); setSession('') }}
                    options={[
                      { label: 'Cardiology', value: 'cardiology' },
                      { label: 'Neurology', value: 'neurology' },
                      { label: 'Orthopedics', value: 'orthopedics' },
                      { label: 'Pediatrics', value: 'pediatrics' },
                    ]} />
                  <FormField as="select" label="Doctor" value={doctor}
                    onChange={e => { setDoctor((e.target as HTMLSelectElement).value); setSession('') }}
                    options={specialty ? doctorsBySpecialty[specialty].map(d => ({ label: d.label, value: d.value })) : []} />
                </div>
                <div className="sch-form-row">
                  <FormField label="Start Date" type="date" value={startDate} rightIcon={calendarIcon}
                    onChange={e => { setStartDate((e.target as HTMLInputElement).value); if (!endDate || endDate < (e.target as HTMLInputElement).value) setEndDate((e.target as HTMLInputElement).value); setHalfDay(false); setSession('') }} />
                  <FormField label="End Date" type="date" value={endDate} rightIcon={calendarIcon}
                    onChange={e => { setEndDate((e.target as HTMLInputElement).value); setHalfDay(false); setSession('') }} />
                </div>
                {isHalfDayEligible && (
                  <div className="lm-halfday-row">
                  <label className="lm-halfday-label" onClick={() => { setHalfDay(!halfDay); setSession('') }}>
                      <span className={`lm-checkbox ${halfDay ? 'checked' : ''}`}>
                        {halfDay && <img src={tickBlue} alt="" style={{ width: 12, height: 12 }} />}
                      </span>
                      Half Day
                    </label>
                  </div>
                )}
                {halfDay && selectedDoctorSessions.length > 1 && (
                  <div className="sch-form-row">
                    <FormField as="select" label="Session" value={session}
                      onChange={e => setSession((e.target as HTMLSelectElement).value)}
                      options={selectedDoctorSessions.map(s => ({ label: s, value: s }))} />
                  </div>
                )}
                <div style={{ marginBottom: 18 }}>
                  <label className="form-field-label">Reason<span className="form-field-required"> *</span></label>
                  <textarea className="doc-textarea" placeholder="Enter reason for leave..." style={{ height: 80 }} />
                </div>
              </div>
            </div>
            <div className="sch-divider" />
            <div className="ip-actions" style={{ padding: '16px 24px' }}>
              <button className="ip-btn ip-cancel" onClick={resetForm}>Cancel</button>
              <button className="ip-btn ip-submit">Submit</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default LeaveManagement
