import type { FC } from 'react'
import growIcon from '../assets/icons/grow-icon.svg'
import appointmentBlueIcon from '../assets/icons/appointment-blue-icon.svg'
import patientsBlueIcon from '../assets/icons/patients-blue-icon.svg'
import upArrowGreen from '../assets/icons/up-arrow-green.svg'
import downArrowRed from '../assets/icons/down-arrow-red.svg'
import './DashboardPage.css'

const formatPatients = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}`

const stats = [
  { label: "Today's Appointments", value: '24', icon: appointmentBlueIcon, sub: '3 confirmed, 2 pending' },
  { label: 'Active Patients', value: formatPatients(120), icon: patientsBlueIcon, badge: '+7%', arrow: upArrowGreen, sub: 'this month' },
  { label: 'Total Patients', value: formatPatients(1840), icon: patientsBlueIcon, badge: '-8%', arrow: downArrowRed, sub: 'From the last month', negative: true },
  { label: 'Revenue', value: '₹52,000', icon: growIcon, badge: '+3%', arrow: upArrowGreen, sub: 'From the last month' },
]

const DashboardPage: FC = () => (
  <div className="dbp-container">
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
          <span className="dbp-card-sub">
            {s.badge && (
              <span className={`dbp-card-badge ${s.negative ? 'negative' : 'positive'}`}>
                {s.badge} <img src={s.arrow} alt="" style={{ width: 14, height: 14 }} />
              </span>
            )}
            {s.sub}
          </span>
        </div>
      ))}
    </div>
  </div>
)

export default DashboardPage
