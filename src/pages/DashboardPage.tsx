import type { FC } from 'react'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import growIcon from '../assets/icons/grow-icon.svg'
import appointmentBlueIcon from '../assets/icons/appointment-blue-icon.svg'
import patientsBlueIcon from '../assets/icons/patients-blue-icon.svg'
import upArrowGreen from '../assets/icons/up-arrow-green.svg'
import downArrowRed from '../assets/icons/down-arrow-red.svg'
import userProfileImg from '../assets/images/user-profile.png'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import './DashboardPage.css'

const formatPatients = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}`

const stats = [
  { label: "Today's Appointments", value: '24', icon: appointmentBlueIcon, sub: '3 confirmed, 2 pending' },
  { label: 'Active Patients', value: formatPatients(120), icon: patientsBlueIcon, badge: '+7%', arrow: upArrowGreen, sub: 'this month' },
  { label: 'Total Patients', value: formatPatients(1840), icon: patientsBlueIcon, badge: '-8%', arrow: downArrowRed, sub: 'From the last month', negative: true },
  { label: 'Revenue', value: '₹52,000', icon: growIcon, badge: '+3%', arrow: upArrowGreen, sub: 'From the last month' },
]

const revenueData = [
  { month: 'Jan', value: 30000 },
  { month: 'Feb', value: 42000 },
  { month: 'Mar', value: 35000 },
  { month: 'Apr', value: 50000 },
  { month: 'May', value: 52000 },
  { month: 'Jun', value: 47000 },
]

const appointmentData = [
  { month: 'Jan', active: 80, cancelled: 20 },
  { month: 'Feb', active: 120, cancelled: 30 },
  { month: 'Mar', active: 60, cancelled: 10 },
  { month: 'Apr', active: 150, cancelled: 40 },
  { month: 'May', active: 100, cancelled: 25 },
  { month: 'Jun', active: 40, cancelled: 15 },
  { month: 'Jul', active: 90, cancelled: 20 },
  { month: 'Aug', active: 110, cancelled: 35 },
  { month: 'Sep', active: 75, cancelled: 18 },
  { month: 'Oct', active: 130, cancelled: 28 },
  { month: 'Nov', active: 95, cancelled: 22 },
  { month: 'Dec', active: 60, cancelled: 12 },
]

const activeDoctors = [
  { name: 'Dr. Daniel Hamilton', specialty: 'Cardiology', session: '09:00 AM – 01:00 PM' },
  { name: 'Dr. Sarah Johnson', specialty: 'Neurology', session: '10:00 AM – 02:00 PM' },
  { name: 'Dr. Priya Menon', specialty: 'Dermatology', session: '08:30 AM – 12:30 PM' },
  { name: 'Dr. Arjun Nair', specialty: 'Orthopedics', session: '11:00 AM – 03:00 PM' },
  { name: 'Dr. Fatima Sheikh', specialty: 'Pediatrics', session: '09:30 AM – 01:30 PM' },
]

const todayPatients = [
  { name: 'Aisha Patel', time: '09:00 AM', status: 'Confirmed' },
  { name: 'Ravi Kumar', time: '09:30 AM', status: 'Pending' },
  { name: 'Meera Nair', time: '10:00 AM', status: 'Confirmed' },
  { name: 'John Mathew', time: '10:30 AM', status: 'Confirmed' },
  { name: 'Priya Singh', time: '11:00 AM', status: 'Pending' },
  { name: 'Arjun Das', time: '11:30 AM', status: 'Confirmed' },
  { name: 'Fatima Banu', time: '12:00 PM', status: 'Confirmed' },
  { name: 'Samuel Roy', time: '02:00 PM', status: 'Pending' },
]

const AptTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; fill: string }[] }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="dbp-tooltip">
      {payload.map(p => (
        <div key={p.name} className="dbp-tooltip-row">
          <span className="dbp-tooltip-dot" style={{ background: p.fill }} />
          <span>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const months = ['Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25']

const DashboardPage: FC = () => {
  const [revenueMonth, setRevenueMonth] = useState('Jan 25')

  return (
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

      <div className="dbp-main">
        {/* Left 80% */}
        <div className="dbp-left">
          <div className="dbp-charts-row">
            {/* Total Revenue - 40% */}
            <div className="dbp-chart-card dbp-chart-revenue">
              <div className="dbp-chart-header">
                <h3 className="dbp-chart-title">Total Revenue</h3>
                <select className="dbp-month-select" value={revenueMonth} onChange={e => setRevenueMonth(e.target.value)}>
                  {months.map(m => <option key={m} value={m}>This Month {m}</option>)}
                </select>
              </div>
              <div className="dbp-revenue-amount">₹35,940.89</div>
              <div className="dbp-card-sub" style={{ marginBottom: 12 }}>
                <span className="dbp-card-badge positive">
                  +2% <img src={upArrowGreen} alt="" style={{ width: 14, height: 14 }} />
                </span>
                From this month
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#79B586" stopOpacity={1} />
                      <stop offset="95%" stopColor="#79B586" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Area type="linear" dataKey="value" stroke="none" fill="url(#revenueGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Appointment Overview - 60% */}
            <div className="dbp-chart-card dbp-chart-appointments">
              <div className="dbp-chart-header">
                <h3 className="dbp-chart-title">Appointment Overview</h3>
                <div className="dbp-apt-legend">
                  <span className="dbp-legend-box" style={{ background: '#C1DAFF' }} />
                  <span className="dbp-legend-label">Cancelled</span>
                  <span className="dbp-legend-box" style={{ background: '#3B82F6' }} />
                  <span className="dbp-legend-label">Active</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={appointmentData} barCategoryGap={10}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<AptTooltip />} shared />
                  <Bar dataKey="active" name="Active" fill="#3B82F6" radius={[0, 0, 8, 8]} stackId="a" barSize={30} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#C1DAFF" radius={[8, 8, 0, 0]} stackId="a" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Today's Active Doctors */}
          <div className="dbp-chart-card" style={{ marginTop: 16 }}>
            <h3 className="dbp-chart-title">Today's Active Doctors</h3>
            <div className="dbp-doctors-grid">
              {activeDoctors.map((d, i) => (
                <div key={i} className="dbp-doctor-card">
                  <img src={doctorProfileImg} alt={d.name} className="dbp-doctor-avatar" />
                  <div className="dbp-doctor-info">
                    <span className="dbp-doctor-name">{d.name}</span>
                    <span className="dbp-doctor-specialty">{d.specialty}</span>
                    <span className="dbp-doctor-session">{d.session}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 20% */}
        <div className="dbp-right">
          <h3 className="dbp-chart-title">Today's Appointments</h3>
          <div className="dbp-apt-list">
            {todayPatients.map((p, i) => (
              <div key={i} className="dbp-apt-item">
                <img src={userProfileImg} alt={p.name} className="dbp-apt-avatar" />
                <div className="dbp-apt-info">
                  <span className="dbp-apt-name">{p.name}</span>
                  <span className="dbp-apt-time">{p.time}</span>
                </div>
                <span className={`dbp-apt-status ${p.status === 'Confirmed' ? 'confirmed' : 'pending'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
