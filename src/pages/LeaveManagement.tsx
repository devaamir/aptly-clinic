import type { FC } from 'react'
import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import {
  getLeaves,
  applyLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
  getDoctors,
} from '../services/api'
import type { Leave, LeaveStatus, LeaveSession, AppointmentDoctor } from '../services/types'
import { useAppContext } from '../context/AppContext'
import SlidePanel from '../components/SlidePanel'
import addIcon from '../assets/icons/add-icon-white.svg'
import calendarIcon from '../assets/icons/calendar.svg'
import tickBlue from '../assets/icons/tick-icon.svg'
import warningIcon from '../assets/icons/warning-red.svg'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import folderIcon from '../assets/images/folder-icon.png'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import './LeaveManagement.css'
import './Doctors.css'

type Filter = 'All' | 'Approved' | 'Rejected' | 'Pending' | 'Cancelled'

const statusProps: Record<LeaveStatus, { bgColor: string; textColor: string; dotColor: string }> = {
  Approved:  { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Rejected:  { bgColor: '#FEF3F2', textColor: '#B42318', dotColor: '#F04438' },
  Pending:   { bgColor: '#FFFAEB', textColor: '#B54708', dotColor: '#F79009' },
  Cancelled: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#667085' },
}

const LeaveManagement: FC = () => {
  const { activeContext } = useAppContext()
  const role = activeContext?.role?.toLowerCase() ?? ''
  const isAdmin = role === 'medical-center-manager' || role === 'staff-member'

  // ── List state ──────────────────────────────────────────────────────────────
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  // ── Action state ─────────────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<Leave | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Leave | null>(null)
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // ── Apply Leave form state ───────────────────────────────────────────────────
  const [showApply, setShowApply] = useState(false)
  const [showAppointmentWarning, setShowAppointmentWarning] = useState(false)
  const [doctors, setDoctors] = useState<AppointmentDoctor[]>([])
  const [doctor, setDoctor] = useState('')
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(todayStr)
  const [halfDay, setHalfDay] = useState(false)
  const [session, setSession] = useState<LeaveSession | ''>('')
  const [reason, setReason] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isHalfDayEligible = startDate && endDate && startDate === endDate

  // ── Fetch leaves ─────────────────────────────────────────────────────────────
  const fetchLeaves = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page
    if (resetPage) setPage(1)
    setLoading(true)
    setError(null)
    try {
      const res = await getLeaves({
        status: filter === 'All' ? undefined : filter as LeaveStatus,
        search: search.trim() || undefined,
        page: currentPage,
        limit: 20,
      })
      setLeaves(res.data)
      setHasNextPage(res.pagination.hasNextPage)
    } catch {
      setError('Failed to load leave requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filter, search, page])

  useEffect(() => {
    fetchLeaves(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchLeaves(true), 400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // ── Load doctors when Apply modal opens ──────────────────────────────────────
  useEffect(() => {
    if (!showApply) return
    getDoctors()
      .then(res => setDoctors(res.data))
      .catch(() => {})
  }, [showApply])

  // ── Reset Apply form ──────────────────────────────────────────────────────────
  const resetForm = () => {
    setShowApply(false)
    setDoctor('')
    setStartDate(todayStr)
    setEndDate(todayStr)
    setHalfDay(false)
    setSession('')
    setReason('')
    setSubmitError(null)
  }

  // ── Submit Apply Leave ────────────────────────────────────────────────────────
  // Step 1: validate form, then show appointment warning modal
  const handleSubmitClick = () => {
    setSubmitError(null)
    if (!startDate || !endDate) { setSubmitError('Please select start and end dates.'); return }
    if (!reason.trim()) { setSubmitError('Please enter a reason for the leave.'); return }
    if (isAdmin && !doctor) { setSubmitError('Please select a doctor.'); return }
    if (halfDay && !session) { setSubmitError('Please select a session (morning or afternoon) for half day.'); return }
    // Close Apply modal, open warning modal
    setShowApply(false)
    setShowAppointmentWarning(true)
  }

  // Step 2: confirmed — actually call the API
  const handleConfirmSubmit = async () => {
    setShowAppointmentWarning(false)
    setSubmitLoading(true)
    setSubmitError(null)
    try {
      const payload: Parameters<typeof applyLeave>[0] = {
        startDate,
        endDate,
        isHalfDay: halfDay,
        session: halfDay ? (session as LeaveSession) : null,
        reason: reason.trim(),
        ...(isAdmin && doctor ? { doctorId: doctor } : {}),
      }
      const res = await applyLeave(payload)
      setLeaves(prev => [res.data, ...prev])
      resetForm()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string; errors?: { message: string }[] } } })
        ?.response?.data
      if (msg?.errors?.length) {
        setSubmitError(msg.errors.map(e => e.message).join(' · '))
      } else {
        setSubmitError(msg?.message ?? 'Failed to submit leave. Please try again.')
      }
      // Re-open Apply modal so user can see the error and fix it
      setShowApply(true)
    } finally {
      setSubmitLoading(false)
    }
  }

  // ── Cancel Leave ──────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await cancelLeave(cancelTarget.id)
      setLeaves(prev => prev.map(l => l.id === res.data.id ? { ...l, status: res.data.status, updatedAt: res.data.updatedAt } : l))
      setCancelTarget(null)
    } catch {
      setActionError('Failed to cancel leave. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Approve Leave ─────────────────────────────────────────────────────────────
  const handleApprove = async (leave: Leave) => {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await approveLeave(leave.id)
      setLeaves(prev => prev.map(l => l.id === res.data.id ? { ...l, status: res.data.status, updatedAt: res.data.updatedAt } : l))
    } catch {
      setActionError('Failed to approve leave. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Reject Leave ──────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectTarget) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await rejectLeave(rejectTarget.id)
      setLeaves(prev => prev.map(l => l.id === res.data.id ? { ...l, status: res.data.status, updatedAt: res.data.updatedAt } : l))
      setRejectTarget(null)
    } catch {
      setActionError('Failed to reject leave. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="lm-container">
      <PageHeader title="Leave Management" actions={
        <button className="lm-apply-btn" onClick={() => setShowApply(true)}>
          <img src={addIcon} alt="" style={{ width: 16, height: 16 }} />
          Apply Leave
        </button>
      } />

      {actionError && (
        <div className="lm-action-error">{actionError}</div>
      )}

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
            {(['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'] as Filter[]).map(f => (
              <button key={f} className={`lm-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <button className="lm-icon-btn"><img src={sortIcon} alt="sort" /></button>
          <button className="lm-icon-btn" onClick={() => fetchLeaves(true)}><img src={reloadIcon} alt="reload" /></button>
        </div>
      </div>

      <div className="lm-main-card">
        <table className="lm-table">
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '20%' }} />
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
            {loading ? (
              <tr>
                <td colSpan={7} className="lm-empty">
                  <div className="lm-empty-state">
                    <span className="lm-empty-title">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="lm-empty">
                  <div className="lm-empty-state">
                    <span className="lm-empty-title" style={{ color: '#F04438' }}>{error}</span>
                  </div>
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="lm-empty">
                  <div className="lm-empty-state">
                    <img src={folderIcon} alt="No leave requests" className="lm-empty-icon" />
                    <span className="lm-empty-title">No Records Found</span>
                    <span className="lm-empty-sub">We couldn't find anything matching your criteria. Try changing your filters or add something new.</span>
                  </div>
                </td>
              </tr>
            ) : leaves.map(l => (
              <tr key={l.id}>
                <td className="lm-cell">{l.appliedDate}</td>
                <td>
                  <div className="doc-cell">
                    <img src={l.doctor.profilePicture || doctorProfileImg} alt={l.doctor.name} className="doc-avatar" />
                    <div className="lm-doctor-info">
                      <span className="lm-doctor-name">{l.doctor.name}</span>
                      {l.doctor.specialty && <span className="lm-doctor-spec">{l.doctor.specialty}</span>}
                    </div>
                  </div>
                </td>
                <td className="lm-cell">{l.startDate}</td>
                <td className="lm-cell">{l.endDate}</td>
                <td className="lm-cell">{l.duration}</td>
                <td><Badge text={l.status} {...statusProps[l.status]} /></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div className="lm-actions-cell">
                    {isAdmin && l.status === 'Pending' && l.creatorRole !== 'medical-center-manager' && (
                      <>
                        <button
                          className="lm-approve-btn"
                          disabled={actionLoading}
                          onClick={() => handleApprove(l)}
                        >
                          Approve
                        </button>
                        <button
                          className="lm-reject-btn"
                          disabled={actionLoading}
                          onClick={() => setRejectTarget(l)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(l.status === 'Approved' || l.status === 'Pending') && new Date(l.startDate) > new Date() && (
                      <>
                        {isAdmin && l.status === 'Pending' && l.creatorRole !== 'medical-center-manager' && <span className="lm-action-divider" />}
                        <button className="lm-cancel-btn" onClick={() => setCancelTarget(l)}>
                          Cancel
                        </button>
                      </>
                    )}
                    <button className="pat-dots-btn lm-dots-btn" onClick={() => setSelectedLeave(l)}>
                      <img src={dotsIcon} alt="details" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {(page > 1 || hasNextPage) && (
          <div className="lm-pagination">
            <button
              className="lm-page-btn"
              disabled={page === 1 || loading}
              onClick={() => { setPage(p => p - 1); fetchLeaves() }}
            >
              Previous
            </button>
            <span className="lm-page-num">Page {page}</span>
            <button
              className="lm-page-btn"
              disabled={!hasNextPage || loading}
              onClick={() => { setPage(p => p + 1); fetchLeaves() }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── Cancel Confirm Modal ─────────────────────────────────────────────── */}
      {cancelTarget && (
        <Modal onClose={() => { setCancelTarget(null); setActionError(null) }}>
          <div className="lm-confirm-modal">
            <div className="lm-confirm-icon-wrap">
              <img src={warningIcon} alt="" style={{ width: 56, height: 56 }} />
            </div>
            <h3 className="lm-confirm-title">Cancel Leave</h3>
            <p className="lm-confirm-desc">
              Are you sure you want to cancel the leave for <strong>{cancelTarget.doctor.name}</strong> from <strong>{cancelTarget.startDate}</strong> to <strong>{cancelTarget.endDate}</strong>? This action will update the leave status and notify the relevant parties.
            </p>
            {actionError && <p style={{ color: '#F04438', fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>{actionError}</p>}
            <div className="lm-confirm-actions">
              <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => { setCancelTarget(null); setActionError(null) }} disabled={actionLoading}>Keep Leave</button>
              <button className="ip-btn ip-submit" style={{ flex: 1, background: '#FF5A4F' }} onClick={handleCancel} disabled={actionLoading}>
                {actionLoading ? 'Cancelling...' : 'Cancel Leave'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Reject Confirm Modal ─────────────────────────────────────────────── */}
      {rejectTarget && (
        <Modal onClose={() => { setRejectTarget(null); setActionError(null) }}>
          <div className="lm-confirm-modal">
            <div className="lm-confirm-icon-wrap">
              <img src={warningIcon} alt="" style={{ width: 56, height: 56 }} />
            </div>
            <h3 className="lm-confirm-title">Reject Leave</h3>
            <p className="lm-confirm-desc">
              Are you sure you want to reject the leave request for <strong>{rejectTarget.doctor.name}</strong>?
            </p>
            {actionError && <p style={{ color: '#F04438', fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>{actionError}</p>}
            <div className="lm-confirm-actions">
              <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => { setRejectTarget(null); setActionError(null) }} disabled={actionLoading}>Go Back</button>
              <button className="ip-btn ip-submit" style={{ flex: 1, background: '#FF5A4F' }} onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Reject Leave'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Appointment Warning Modal ────────────────────────────────────────── */}
      {showAppointmentWarning && (
        <Modal onClose={() => setShowAppointmentWarning(false)}>
          <div className="lm-confirm-modal">
            <div className="lm-confirm-icon-wrap">
              <img src={warningIcon} alt="" style={{ width: 56, height: 56 }} />
            </div>
            <h3 className="lm-confirm-title">Appointments May Be Affected</h3>
            <p className="lm-confirm-desc">
              Any existing appointments or schedules during this leave period will be cancelled. Patients will be notified about the cancellation automatically.
            </p>
            <p className="lm-confirm-desc" style={{ fontSize: 12, color: '#A0A5B1', marginTop: -4 }}>
              Do you want to proceed?
            </p>
            <div className="lm-confirm-actions">
              <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => { setShowAppointmentWarning(false); setShowApply(true) }}>
                Go Back
              </button>
              <button className="ip-btn ip-submit" style={{ flex: 1 }} onClick={handleConfirmSubmit}>
                Yes, Apply Leave
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Apply Leave Modal ────────────────────────────────────────────────── */}
      {showApply && (
        <Modal onClose={resetForm} autoSize>
          <div style={{ width: 520 }}>
            <div className="sch-header">
              <h2 className="sch-title">Apply Leave</h2>
              <button className="sch-close" onClick={resetForm}>✕</button>
            </div>
            <div className="sch-divider" />
            <div className="modal-body-scroll">
              <div className="sch-body">
                {/* Doctor selector — only shown to admin/manager, doctor uses their own token */}
                {isAdmin && (
                  <div style={{ marginBottom: 18 }}>
                    <FormField
                      as="select"
                      label="Doctor / Staff"
                      value={doctor}
                      selectPlaceholder="Select Doctor / Staff"
                      onChange={e => setDoctor((e.target as HTMLSelectElement).value)}
                      options={[
                        ...doctors.map(d => ({ value: d.id, label: d.name })),
                      ]}
                    />
                  </div>
                )}

                <div className="sch-form-row">
                  <FormField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    rightIcon={calendarIcon}
                    onChange={e => {
                      const val = (e.target as HTMLInputElement).value
                      setStartDate(val)
                      if (!endDate || endDate < val) setEndDate(val)
                      setHalfDay(false)
                      setSession('')
                    }}
                  />
                  <FormField
                    label="End Date"
                    type="date"
                    value={endDate}
                    rightIcon={calendarIcon}
                    onChange={e => {
                      setEndDate((e.target as HTMLInputElement).value)
                      setHalfDay(false)
                      setSession('')
                    }}
                  />
                </div>

                {isHalfDayEligible && (
                  <div className="lm-halfday-row">
                    <label className="lm-halfday-label" onClick={() => { setHalfDay(h => !h); setSession('') }}>
                      <span className={`lm-checkbox ${halfDay ? 'checked' : ''}`}>
                        {halfDay && <img src={tickBlue} alt="" style={{ width: 12, height: 12 }} />}
                      </span>
                      Half Day
                    </label>
                    {halfDay && (
                      <div className="lm-session-group">
                        {(['morning', 'afternoon'] as LeaveSession[]).map(s => (
                          <label key={s} className="lm-session-option">
                            <input
                              type="radio"
                              name="session"
                              value={s}
                              checked={session === s}
                              onChange={() => setSession(s)}
                            />
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: 18 }}>
                  <label className="form-field-label">
                    Reason<span className="form-field-required"> *</span>
                  </label>
                  <textarea
                    className="doc-textarea"
                    placeholder="Enter reason for leave..."
                    style={{ height: 80 }}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                </div>

                {submitError && (
                  <p style={{ color: '#F04438', fontSize: 13, margin: '-8px 0 12px' }}>{submitError}</p>
                )}
              </div>
            </div>
            <div className="sch-divider" />
            <div className="ip-actions" style={{ padding: '16px 24px' }}>
              <button className="ip-btn ip-cancel" onClick={resetForm} disabled={submitLoading}>Cancel</button>
              <button className="ip-btn ip-submit" onClick={handleSubmitClick} disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {selectedLeave && (
        <SlidePanel title="Leave Details" onClose={() => setSelectedLeave(null)}>
          <div className="lm-detail-panel">

            {/* Doctor info */}
            <div className="lm-detail-section">
              <div className="lm-detail-doctor-row">
                <img src={selectedLeave.doctor.profilePicture || doctorProfileImg} alt={selectedLeave.doctor.name} className="lm-detail-avatar" />
                <div>
                  <div className="lm-detail-doctor-name">{selectedLeave.doctor.name}</div>
                  {selectedLeave.doctor.specialty && <div className="lm-detail-doctor-spec">{selectedLeave.doctor.specialty}</div>}
                </div>
                <Badge text={selectedLeave.status} {...statusProps[selectedLeave.status]} />
              </div>
            </div>

            <div className="lm-detail-divider" />

            {/* Leave details grid */}
            <div className="lm-detail-section">
              <div className="lm-detail-grid">
                <div className="lm-detail-item">
                  <span className="lm-detail-label">Applied Date</span>
                  <span className="lm-detail-value">{selectedLeave.appliedDate}</span>
                </div>
                <div className="lm-detail-item">
                  <span className="lm-detail-label">Duration</span>
                  <span className="lm-detail-value">{selectedLeave.duration}</span>
                </div>
                <div className="lm-detail-item">
                  <span className="lm-detail-label">Start Date</span>
                  <span className="lm-detail-value">{selectedLeave.startDate}</span>
                </div>
                <div className="lm-detail-item">
                  <span className="lm-detail-label">End Date</span>
                  <span className="lm-detail-value">{selectedLeave.endDate}</span>
                </div>
                {selectedLeave.isHalfDay && (
                  <div className="lm-detail-item">
                    <span className="lm-detail-label">Session</span>
                    <span className="lm-detail-value" style={{ textTransform: 'capitalize' }}>{selectedLeave.session}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lm-detail-divider" />

            {/* Reason */}
            <div className="lm-detail-section">
              <span className="lm-detail-label">Reason</span>
              <p className="lm-detail-reason">{selectedLeave.reason}</p>
            </div>

            {/* Rejection reason — only if rejected */}
            {selectedLeave.status === 'Rejected' && selectedLeave.rejectionReason && (
              <>
                <div className="lm-detail-divider" />
                <div className="lm-detail-section">
                  <span className="lm-detail-label">Rejection Reason</span>
                  <p className="lm-detail-reason" style={{ color: '#B42318' }}>{selectedLeave.rejectionReason}</p>
                </div>
              </>
            )}

          </div>
        </SlidePanel>
      )}
    </div>
  )
}

export default LeaveManagement
