import type { FC } from 'react'
import { useState, useEffect, useRef } from 'react'
import logo from '../assets/images/logo.png'
import logoIcon from '../assets/images/logo-icon.png'
import QueueManagement from './QueueManagement'
import Appointments from './Appointments'
import DoctorSettings from './DoctorSettings'
import DoctorSchedulePage from './DoctorSchedulePage'
import LeaveManagement from './LeaveManagement'
import Modal from '../components/Modal'
import { switchContext, getContexts } from '../services/api'
import { useAppContext } from '../context/AppContext'
import queueIcon from '../assets/icons/quemanagment-icon.svg'
import appointmentIcon from '../assets/icons/appointment-icon.svg'
import leaveIcon from '../assets/icons/leave-managment.svg'
import calendarIcon from '../assets/icons/calendar.svg'
import settingsIcon from '../assets/icons/settings-icon.svg'
import notificationIcon from '../assets/icons/notification-icon.svg'
import arrowDownIcon from '../assets/icons/arrow-down.svg'
import navExpandIcon from '../assets/icons/nav-expand-icon.svg'
import './Dashboard.css'

type ActivePage = 'Queue Management' | 'Appointments' | 'Schedule' | 'Leave Management' | 'Settings'

interface DoctorDashboardProps {
  onSwitchProfile: () => void
  onSwitchToDashboard: () => void
}

const navItems: { label: ActivePage; icon: string }[] = [
  { label: 'Queue Management', icon: queueIcon },
  { label: 'Appointments', icon: appointmentIcon },
  { label: 'Schedule', icon: calendarIcon },
  { label: 'Leave Management', icon: leaveIcon },
]

const DoctorDashboard: FC<DoctorDashboardProps> = ({ onSwitchProfile, onSwitchToDashboard }) => {
  const { activeContext, activeDoctor, contexts, setTokens, setActiveContext, setActiveDoctor, setContexts, logout } = useAppContext()
  const [activePage, setActivePage] = useState<ActivePage>('Queue Management')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const [switchTarget, setSwitchTarget] = useState<{ name: string; role: string; avatar: string; id: string } | null>(null)
  const [showLogout, setShowLogout] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (contexts.length === 0) {
      getContexts().then(res => { if (res.success) setContexts(res.data) }).catch(() => {})
    }
  }, [])

  return (
    <>
      <div className="dashboard">
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
          <div className="sidebar-logo">
            <img src={sidebarCollapsed ? logoIcon : logo} alt="Aptly" />
          </div>
          <button className="sidebar-edge-toggle" onClick={() => setSidebarCollapsed(c => !c)} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <img src={navExpandIcon} alt="toggle sidebar" className={`sidebar-collapse-icon${sidebarCollapsed ? ' rotated' : ''}`} />
          </button>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <div
                key={item.label}
                className={`nav-item ${activePage === item.label ? 'nav-item-active' : ''}`}
                onClick={() => { setActivePage(item.label); setSidebarOpen(false) }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <img src={item.icon} alt="" className="nav-icon" />
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </div>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="topbar">
            <button className="topbar-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              <span /><span /><span />
            </button>

            <div className="topbar-title">{activePage}</div>

            <div className="topbar-right">
              <button
                className={`topbar-icon-btn${activePage === 'Settings' ? ' topbar-icon-btn-active' : ''}`}
                onClick={() => setActivePage('Settings')}
              >
                <img src={settingsIcon} alt="settings" style={{ width: 20, height: 20 }} />
              </button>
              <button className="topbar-icon-btn">
                <img src={notificationIcon} alt="notifications" style={{ width: 20, height: 20 }} />
              </button>
              <div style={{ position: 'relative' }} ref={profileMenuRef}>
                <div className="topbar-profile" style={{ cursor: 'pointer' }} onClick={() => setShowProfileMenu(p => !p)}>
                  <img
                    src={activeDoctor?.profilePicture || activeContext?.medicalCenter.profilePicture || 'https://i.pravatar.cc/32?img=20'}
                    alt="profile"
                    className="topbar-avatar"
                  />
                  <div className="topbar-profile-info">
                    <span className="topbar-hospital-name">
                      {activeDoctor?.name || activeContext?.medicalCenter.name || 'Doctor'}
                    </span>
                    <span className="topbar-role">{activeContext?.role ?? ''}</span>
                  </div>
                  <img src={arrowDownIcon} alt="" style={{ width: 16, height: 16, opacity: 0.5 }} />
                </div>

                {showProfileMenu && (
                  <div className="profile-menu">
                    {contexts.map(c => (
                      <div
                        key={c.medicalCenter.id + c.role}
                        className={`profile-menu-item ${activeContext?.medicalCenter.id === c.medicalCenter.id && activeContext?.role === c.role ? 'active' : ''}`}
                        onClick={() => {
                          setShowProfileMenu(false)
                          setSwitchTarget({
                            id: c.medicalCenter.id,
                            name: c.medicalCenter.name,
                            role: c.role,
                            avatar: c.medicalCenter.profilePicture || `https://i.pravatar.cc/32?u=${c.medicalCenter.id}`
                          })
                        }}
                      >
                        <img
                          src={c.medicalCenter.profilePicture || `https://i.pravatar.cc/32?u=${c.medicalCenter.id}`}
                          alt={c.medicalCenter.name}
                          className="profile-menu-avatar"
                        />
                        <div className="profile-menu-info">
                          <div className="profile-menu-name">{c.medicalCenter.name}</div>
                          <div className="profile-menu-role">{c.role}</div>
                        </div>
                        {activeContext?.medicalCenter.id === c.medicalCenter.id && activeContext?.role === c.role && null}
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

          {activePage === 'Queue Management' && <QueueManagement />}
          {activePage === 'Appointments' && <Appointments />}
          {activePage === 'Schedule' && <DoctorSchedulePage />}
          {activePage === 'Leave Management' && <LeaveManagement />}
          {activePage === 'Settings' && <DoctorSettings />}
        </main>
      </div>

      {/* Switch Profile Confirm Modal */}
      {switchTarget && (
        <Modal onClose={() => setSwitchTarget(null)} autoSize>
          <div style={{ padding: 24, textAlign: 'center' }}>
            <img src={switchTarget.avatar} alt={switchTarget.name} style={{ width: 56, height: 56, borderRadius: '50%', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Manrope' }}>Switch Account?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#636A79', fontFamily: 'Manrope' }}>
              Switch to <strong>{switchTarget.name}</strong> as <strong>{switchTarget.role}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ip-btn ip-cancel" style={{ flex: 1 }} onClick={() => setSwitchTarget(null)}>Cancel</button>
              <button
                className="ip-btn ip-submit"
                style={{ flex: 1 }}
                onClick={async () => {
                  if (!switchTarget) return
                  const ctx = contexts.find(c => c.medicalCenter.id === switchTarget.id && c.role === switchTarget.role)
                  if (ctx) {
                    try {
                      const res = await switchContext(ctx.role, ctx.medicalCenter.id)
                      if (res.success) {
                        setTokens(res.data.accessToken, res.data.refreshToken)
                        setActiveContext({ role: ctx.role, medicalCenter: res.data.medicalCenter })
                        setActiveDoctor(res.data.doctor)
                      }
                    } catch {
                      setActiveContext(ctx)
                    }
                    // If switching to another doctor profile, stay; otherwise go to clinic dashboard
                    if (ctx.role !== 'doctor') {
                      onSwitchToDashboard()
                    }
                  }
                  setSwitchTarget(null)
                }}
              >
                Switch
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Logout Modal */}
      {showLogout && (
        <Modal onClose={() => setShowLogout(false)}>
          <div className="sch-header">
            <h2 className="sch-title">Logout</h2>
            <button className="sch-close" onClick={() => setShowLogout(false)}>✕</button>
          </div>
          <div className="sch-divider" />
          <p style={{ margin: '24px 24px 8px', fontSize: 14, color: '#636A79', fontFamily: 'Manrope' }}>Are you sure you want to logout?</p>
          <div className="sch-divider" style={{ marginTop: 24 }} />
          <div className="ip-actions" style={{ padding: '16px 24px' }}>
            <button className="ip-btn ip-cancel" onClick={() => setShowLogout(false)}>Cancel</button>
            <button className="ip-btn ip-submit" style={{ background: '#FF5A4F' }} onClick={() => { logout(); window.location.href = '/' }}>Logout</button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default DoctorDashboard
