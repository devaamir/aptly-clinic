import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import InputBox from '../components/InputBox'
import Modal from '../components/Modal'
import DoctorFormModal from '../components/DoctorFormModal'
import { getDoctors, getDoctor, deleteDoctor } from '../services/api'
import type { AppointmentDoctor, DoctorDetail } from '../services/types'
import { useAppContext } from '../context/AppContext'
import searchIcon from '../assets/icons/search-icon.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import upDownArrow from '../assets/icons/up-down-arrow.svg'
import Toast from '../components/Toast'
import verifyTickGreen from '../assets/icons/verify-tick-green.svg'
import addIcon from '../assets/icons/add-icon-white.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import folderIcon from '../assets/images/folder-icon.png'
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
  phone: d.phoneNumber || '',
  email: d.emailAddress,
  experience: `${d.yearsOfExperience} yrs`,
  status: 'Active',
})

const statusProps = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

const Doctors: FC<{ onViewProfile: (d: DoctorDetail) => void }> = ({ onViewProfile }) => {
  const { activeContext } = useAppContext()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  useEffect(() => {
    setLoading(true)
    getDoctors(activeContext?.medicalCenter.id)
      .then(res => { if (res.success) setDoctors(res.data.map(mapDoctor)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeContext?.medicalCenter.id])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteDoctor(deleteTarget.doctorUuid, activeContext!.medicalCenter.id)
      setDoctors(prev => prev.filter(d => d.doctorUuid !== deleteTarget.doctorUuid))
      setDeleteTarget(null)
    } catch { /* silent */ } finally { setDeleteLoading(false) }
  }

  const filtered = doctors.filter(d =>
    !searchQuery.trim() ||
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="doc-container">
      <PageHeader
        title="Doctors"
        actions={
          <div className="doc-actions">
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
            {/* <button className="doc-icon-btn"><img src={upDownArrow} alt="order" /></button> */}
            {/* <button className="doc-icon-btn"><img src={sortIcon} alt="sort" /></button> */}
            <button className="doc-icon-btn"><img src={reloadIcon} alt="reload" /></button>
            <button className="doc-add-btn" onClick={() => setShowAdd(true)}>
              <img src={addIcon} alt="" style={{ width: 16, height: 16 }} />
              Add Doctor
            </button>
          </div>
        }
      />

      <div className="doc-main-card doc-table-card">
        {loading ? (
          <div className="apt-loader-wrap"><div className="apt-loader" /></div>
        ) : (
          <table className="doc-table">
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '22%' }} />
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
                <th className="doc-label">STATUS</th>
                <th className="doc-label"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="doc-no-results">
                    <div className="doc-empty-state">
                      <img src={folderIcon} alt="No doctors" className="doc-empty-icon" />
                      <span className="doc-empty-title">No Records Found</span>
                      <span className="doc-empty-sub">We couldn't find anything matching your criteria. Try changing your filters or add something new.</span>
                    </div>
                  </td>
                </tr>
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
                  <td>
                    <span className="doc-status-badge" style={{ background: statusProps[d.status].bgColor, color: statusProps[d.status].textColor }}>
                      <span className="doc-status-dot" style={{ background: statusProps[d.status].dotColor }} />
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div className="doc-menu-wrap" ref={openMenuId === d.id ? menuRef : null}>
                      <button
                        className="pat-dots-btn"
                        onClick={() => setOpenMenuId(prev => prev === d.id ? null : d.id)}
                      >
                        <img src={dotsIcon} alt="more" />
                      </button>
                      {openMenuId === d.id && (
                        <div className="doc-dropdown">
                          <button
                            className="doc-dropdown-item"
                            onClick={() => {
                              setOpenMenuId(null)
                              getDoctor(d.doctorUuid).then(r => { if (r.success) onViewProfile(r.data) }).catch(() => {})
                            }}
                          >
                            View Profile
                          </button>
                          <button
                            className="doc-dropdown-item doc-dropdown-item--danger"
                            onClick={() => {
                              setOpenMenuId(null)
                              setDeleteTarget(d)
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <DoctorFormModal
          onClose={() => setShowAdd(false)}
          onCreated={d => {
            setDoctors(prev => [mapDoctor(d), ...prev])
            setToast('Doctor added successfully')
          }}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} icon={<img src={verifyTickGreen} alt="" />} />}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)} autoSize>
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
