import type { FC } from 'react'
import PageHeader from '../components/PageHeader'
import growIcon from '../assets/icons/grow-icon.svg'
import appointmentBlueIcon from '../assets/icons/appointment-blue-icon.svg'
import patientsBlueIcon from '../assets/icons/patients-blue-icon.svg'
import './DashboardPage.css'

const stats = [
  { label: "Today's Appointments", value: '—', icon: appointmentBlueIcon },
  { label: 'Active Patients', value: '—', icon: patientsBlueIcon },
  { label: 'Total Patients', value: '—', icon: patientsBlueIcon },
  { label: 'Revenue', value: '—', icon: growIcon },
]

const DashboardPage: FC = () => (
  <div className="dbp-container">
    <PageHeader title="Dashboard" />
    <div className="dbp-stats">
      {stats.map(s => (
        <div key={s.label} className="dbp-card">
          <div className="dbp-card-header">
            <span className="dbp-card-label">{s.label}</span>
            <div className="dbp-card-icon">
              <img src={s.icon} alt="" style={{ width: 16, height: 16 }} />
            </div>
          </div>
          <span className="dbp-card-value">{s.value}</span>
        </div>
      ))}
    </div>
  </div>
)

export default DashboardPage
