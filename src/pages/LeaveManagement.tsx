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
import folderIcon from '../assets/images/folder-icon.png'
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

const leaves: Leave[] = []

const LeaveManagement: FC = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [showApply, setShowApply] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [specialty, setSpecialty] = useState('')
  const [doctor, setDoctor] = useState('')
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(todayStr)
  const [halfDay, setHalfDay] = useState(false)
  const [session, setSession] = useState('')

  const isHalfDayEligible = startDate && endDate && startDate === endDate

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
              <tr>
                <td colSpan={7} className="lm-empty">
                  <div className="lm-empty-state">
                    <img src={folderIcon} alt="No leave requests" className="lm-empty-icon" />
                    <span className="lm-empty-title">No Records Found</span>
                    <span className="lm-empty-sub">We couldn't find anything matching your criteria. Try changing your filters or add something new.</span>
                  </div>
                </td>
              </tr>
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
                    options={[]} />
                  <FormField as="select" label="Doctor" value={doctor}
                    onChange={e => { setDoctor((e.target as HTMLSelectElement).value); setSession('') }}
                    options={[]} />
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
