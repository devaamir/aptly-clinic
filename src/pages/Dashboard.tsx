import type { FC } from 'react'
import { useState } from 'react'
import logo from '../assets/images/logo.png'
import QueueManagement from './QueueManagement'
import DashboardPage from './DashboardPage'
import Appointments from './Appointments'
import Patients from './Patients'
import Doctors from './Doctors'
import { useEffect } from 'react'
import DoctorProfile from './DoctorProfile'
import Modal from '../components/Modal'
import LeaveManagement from './LeaveManagement'
import Specialties from './Specialties'
import Settings from './Settings'
import dashboardIcon from '../assets/icons/dashboard-icon.svg'
import queueIcon from '../assets/icons/quemanagment-icon.svg'
import appointmentIcon from '../assets/icons/appointment-icon.svg'
import patientsIcon from '../assets/icons/patients-icon.svg'
import doctorsIcon from '../assets/icons/doctors-icon.svg'
import leaveIcon from '../assets/icons/leave-managment.svg'
import specialtiesIcon from '../assets/icons/specialities-icon.svg'
import settingsIcon from '../assets/icons/settings-icon.svg'
import notificationIcon from '../assets/icons/notification-icon.svg'
import arrowLeftIcon from '../assets/icons/arrow-left.svg'
import arrowDownIcon from '../assets/icons/arrow-down.svg'
import { switchContext, getContexts } from '../services/api'
import { useAppContext } from '../context/AppContext'
import './Dashboard.css'

type ActivePage = 'Dashboard' | 'Queue Management' | 'Appointments' | 'Patients' | 'Doctors' | 'Leave Management' | 'Settings'

interface Doctor { id: string; name: string; avatar: string; specialty: string; phone: string; email: string; experience: string; status: 'Active' | 'Inactive' }

const navItems: { label: ActivePage; icon: string }[] = [
  { label: 'Dashboard', icon: dashboardIcon },
  { label: 'Queue Management', icon: queueIcon },
  { label: 'Appointments', icon: appointmentIcon },
  { label: 'Patients', icon: patientsIcon },
  { label: 'Doctors', icon: doctorsIcon },
  { label: 'Leave Management', icon: leaveIcon },
  { label: 'Settings', icon: settingsIcon },
]

const Dashboard: FC = () => {
  const { activeContext, contexts, setTokens, setActiveContext, setContexts, logout } = useAppContext()
  const [activePage, setActivePage] = useState<ActivePage>('Dashboard')
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [switchTarget, setSwitchTarget] = useState<{ name: string; role: string; avatar: string; id: string } | null>(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    if (contexts.length === 0) {
      getContexts().then(res => { if (res.success) setContexts(res.data) }).catch(() => {})
    }
  }, [])

  return (
    <>
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Aptly" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.label}
              className={`nav-item ${activePage === item.label ? 'nav-item-active' : ''}`}
              onClick={() => { setActivePage(item.label); setViewDoctor(null) }}
            >
              <img src={item.icon} alt="" className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>
      <main className="dashboard-main">
        <div className="topbar">
          <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {viewDoctor ? (
              <>
                <button className="dp-back-btn" onClick={() => setViewDoctor(null)}>
                  <img src={arrowLeftIcon} alt="back" style={{ width: 16, height: 16 }} />
                </button>
                <span style={{ color: '#A0A5B1', fontWeight: 500, cursor: 'pointer' }} onClick={() => setViewDoctor(null)}>Doctors</span>
                <span style={{ color: '#A0A5B1', margin: '0 2px' }}>/</span>
                <span>View Doctor</span>
              </>
            ) : activePage}
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn"><img src={notificationIcon} alt="notifications" style={{ width: 20, height: 20 }} /></button>
            <div style={{ position: 'relative' }}>
              <div className="topbar-profile" style={{ cursor: 'pointer' }} onClick={() => setShowProfileMenu(p => !p)}>
                <img src={activeContext?.medicalCenter.profilePicture || 'https://i.pravatar.cc/32?img=20'} alt="profile" className="topbar-avatar" />
                <div className="topbar-profile-info">
                  <span className="topbar-hospital-name">{activeContext?.medicalCenter.name ?? 'Clinic'}</span>
                  <span className="topbar-role">{activeContext?.role ?? ''}</span>
                </div>
                <img src={arrowDownIcon} alt="" style={{ width: 16, height: 16, opacity: 0.5 }} />
              </div>
              {showProfileMenu && (
                <div className="profile-menu">
                  {contexts.map(c => (
                    <div key={c.medicalCenter.id} className={`profile-menu-item ${activeContext?.medicalCenter.id === c.medicalCenter.id ? 'active' : ''}`} onClick={() => { setShowProfileMenu(false); setSwitchTarget({ id: c.medicalCenter.id, name: c.medicalCenter.name, role: c.role, avatar: c.medicalCenter.profilePicture || `https://i.pravatar.cc/32?u=${c.medicalCenter.id}` }) }}>
                      <img src={c.medicalCenter.profilePicture || `https://i.pravatar.cc/32?u=${c.medicalCenter.id}`} alt={c.medicalCenter.name} className="profile-menu-avatar" />
                      <div>
                        <div className="profile-menu-name">{c.medicalCenter.name}</div>
                        <div className="profile-menu-role">{c.role}</div>
                      </div>
                      {activeContext?.medicalCenter.id === c.medicalCenter.id && <span style={{ marginLeft: 'auto', color: '#2879E4', fontSize: 12 }}>●</span>}
                    </div>
                  ))}
                  <div className="profile-menu-divider" />
                  <div className="profile-menu-logout" onClick={() => { setShowProfileMenu(false); setShowLogout(true) }}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="topbar-divider" />
        {activePage === 'Dashboard' && <DashboardPage />}
        {activePage === 'Queue Management' && <QueueManagement />}
        {activePage === 'Appointments' && <Appointments />}
        {activePage === 'Patients' && <Patients />}
        {activePage === 'Doctors' && !viewDoctor && <Doctors onViewProfile={setViewDoctor} />}
        {activePage === 'Doctors' && viewDoctor && <DoctorProfile doctor={viewDoctor} onBack={() => setViewDoctor(null)} />}
        {activePage === 'Leave Management' && <LeaveManagement />}
        {activePage === 'Settings' && <Settings />}
      </main>
    </div>

    {switchTarget && (
      <Modal onClose={() => setSwitchTarget(null)}>
        <div style={{ width: 400, padding: 24, textAlign: 'center' }}>
          <img src={switchTarget.avatar} alt={switchTarget.name} style={{ width: 56, height: 56, borderRadius: '50%', marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Manrope' }}>Switch Account?</h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#636A79', fontFamily: 'Manrope' }}>
            Switch to <strong>{switchTarget.name}</strong> as <strong>{switchTarget.role}</strong>?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => setSwitchTarget(null)}>Cancel</button>
            <button className="ip-btn ip-submit" style={{ flex: 1 }} onClick={async () => {
              if (!switchTarget) return
              const ctx = contexts.find(c => c.medicalCenter.id === switchTarget.id)
              if (ctx) {
                try {
                  const res = await switchContext(ctx.role, ctx.medicalCenter.id)
                  if (res.success) { setTokens(res.data.accessToken, res.data.refreshToken); setActiveContext(ctx) }
                } catch { setActiveContext(ctx) }
              }
              setSwitchTarget(null)
            }}>Switch</button>
          </div>
        </div>
      </Modal>
    )}
    {showLogout && (
      <Modal onClose={() => setShowLogout(false)}>
        <div style={{ width: 380, padding: 24, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Manrope' }}>Logout</h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#636A79', fontFamily: 'Manrope' }}>Are you sure you want to logout?</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>Cancel</button>
            <button className="ip-btn ip-submit" style={{ flex: 1, background: '#FF5A4F' }} onClick={() => { logout(); window.location.href = '/' }}>Logout</button>
          </div>
        </div>
      </Modal>
    )}
    </>
  )
}

export default Dashboard
