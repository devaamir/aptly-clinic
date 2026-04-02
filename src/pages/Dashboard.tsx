import type { FC } from 'react'
import { useState } from 'react'
import logo from '../assets/images/logo.png'
import QueueManagement from './QueueManagement'
import DashboardPage from './DashboardPage'
import Appointments from './Appointments'
import Patients from './Patients'
import Doctors from './Doctors'
import DoctorProfile from './DoctorProfile'
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
  const [activePage, setActivePage] = useState<ActivePage>('Dashboard')
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null)

  return (
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
            <div className="topbar-profile">
              <img src="https://i.pravatar.cc/32?img=20" alt="profile" className="topbar-avatar" />
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
  )
}

export default Dashboard
