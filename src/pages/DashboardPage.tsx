import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { getDashboard } from '../services/api'
import type { DashboardData } from '../services/api'
import { useAppContext } from '../context/AppContext'
import growIcon from '../assets/icons/grow-icon.svg'
import appointmentBlueIcon from '../assets/icons/appointment-blue-icon.svg'
import patientsBlueIcon from '../assets/icons/patients-blue-icon.svg'
import upArrowGreen from '../assets/icons/up-arrow-green.svg'
import downArrowRed from '../assets/icons/down-arrow-red.svg'
import doctorProfileImg from '../assets/images/doctor-profile.png'
import userProfileImg from '../assets/images/user-profile.png'
import './DashboardPage.css'

import type { DoctorDetail } from '../services/types'

const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}`

const to12h = (t: string) => {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const MONTH_SHORT: Record<string, string> = {
  January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr',
  May: 'May', June: 'Jun', July: 'Jul', August: 'Aug',
  September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
}

const parse12h = (t: string) => {
  const [time, ampm] = t.trim().split(' ')
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

const DoctorStatus = ({ session }: { session: string }) => {
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const parts = session.split('–').map(s => s.trim())
  if (parts.length < 2) return null
  const start = parse12h(parts[0])
  const end = parse12h(parts[1])
  if (cur > end) return null
  const isLive = cur >= start
  return (
    <span className={`dbp-doctor-status ${isLive ? 'live' : 'booking'}`}>
      • {isLive ? 'Live' : 'Booking open'}
    </span>
  )
}

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

const DashboardPage: FC<{ onViewDoctor?: (d: DoctorDetail) => void }> = ({ onViewDoctor }) => {
  const { activeContext } = useAppContext()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [revenueMonth, setRevenueMonth] = useState('Jan 25')

  useEffect(() => {
    const id = activeContext?.medicalCenter.id
    if (!id) return
    getDashboard(id).then(res => setData(res.data)).catch(() => { }).finally(() => setLoading(false))
  }, [activeContext?.medicalCenter.id])

  const aptToday = (data?.todayAppointmentCounts.confirmedCount ?? 0) + (data?.todayAppointmentCounts.cancelledCount ?? 0)
  const activePatients = data?.patients.currentCount ?? 0
  const totalPatients = data?.patients.currentCount ?? 0
  const patientGrowth = data?.patients.growthPercentage ?? 0
  const monthlyGrowth = data?.monthlyAppointments.growthPercentage ?? 0

  const stats = [
    { label: "Today's Appointments", value: String(aptToday), icon: appointmentBlueIcon, sub: `${data?.todayAppointmentCounts.confirmedCount ?? 0} confirmed, ${data?.todayAppointmentCounts.cancelledCount ?? 0} cancelled` },
    { label: 'Active Patients', value: formatNum(activePatients), icon: patientsBlueIcon, badge: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth.toFixed(0)}%`, arrow: monthlyGrowth >= 0 ? upArrowGreen : downArrowRed, sub: 'this month', negative: monthlyGrowth < 0 },
    { label: 'Total Patients', value: formatNum(totalPatients), icon: patientsBlueIcon, badge: `${patientGrowth > 0 ? '+' : ''}${patientGrowth.toFixed(0)}%`, arrow: patientGrowth >= 0 ? upArrowGreen : downArrowRed, sub: 'From the last month', negative: patientGrowth < 0 },
    { label: 'Revenue', value: '₹0', icon: growIcon, badge: '+0%', arrow: upArrowGreen, sub: 'From the last month', negative: false },
  ]

  const appointmentData = (data?.yearlyAppointments ?? []).map(a => ({
    month: MONTH_SHORT[a.month] ?? a.month,
    active: a.confirmedCount,
    cancelled: a.cancelledCount,
  }))

  const revenueData = appointmentData.map(a => ({ month: a.month, value: 0 }))

  const activeDoctors = (data?.todayDoctors ?? []).map(d => ({
    raw: d,
    name: d.name,
    avatar: d.profilePicture || doctorProfileImg,
    specialty: d.specialties[0]?.name ?? '—',
    session: d.schedules[0] ? `${to12h(d.schedules[0].startTime)} – ${to12h(d.schedules[0].stopTime)}` : '—',
  }))

  if (loading) return (
    <div className="dbp-container">
      <div className="dbp-stats">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dbp-card">
            <div className="dbp-sk-row">
              <div className="dbp-sk dbp-sk-line" style={{ width: '60%' }} />
              <div className="dbp-sk dbp-sk-circle" />
            </div>
            <div className="dbp-sk dbp-sk-line" style={{ width: '40%', height: 36 }} />
            <div className="dbp-sk dbp-sk-line" style={{ width: '70%', height: 14 }} />
          </div>
        ))}
      </div>
      <div className="dbp-main">
        <div className="dbp-left">
          <div className="dbp-charts-row">
            <div className="dbp-chart-card dbp-chart-revenue">
              <div className="dbp-sk dbp-sk-line" style={{ width: '50%', marginBottom: 12 }} />
              <div className="dbp-sk dbp-sk-line" style={{ width: '35%', height: 28, marginBottom: 8 }} />
              <div className="dbp-sk dbp-sk-line" style={{ width: '55%', height: 14, marginBottom: 16 }} />
              <div className="dbp-sk dbp-sk-block" style={{ height: 200 }} />
            </div>
            <div className="dbp-chart-card dbp-chart-appointments">
              <div className="dbp-sk dbp-sk-line" style={{ width: '50%', marginBottom: 16 }} />
              <div className="dbp-sk dbp-sk-block" style={{ height: 200 }} />
            </div>
          </div>
          <div className="dbp-chart-card" style={{ marginTop: 16 }}>
            <div className="dbp-sk dbp-sk-line" style={{ width: '30%', marginBottom: 16 }} />
            <div className="dbp-doctors-grid">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="dbp-doctor-card">
                  <div className="dbp-doctor-top">
                    <div className="dbp-sk dbp-sk-avatar" />
                    <div style={{ flex: 1 }}>
                      <div className="dbp-sk dbp-sk-line" style={{ width: '80%', marginBottom: 8 }} />
                      <div className="dbp-sk dbp-sk-line" style={{ width: '50%' }} />
                    </div>
                  </div>
                  <div className="dbp-doctor-bottom">
                    <div className="dbp-sk dbp-sk-line" style={{ width: '90%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dbp-right">
          <div className="dbp-sk dbp-sk-line" style={{ width: '70%', marginBottom: 16 }} />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="dbp-apt-item" style={{ marginBottom: 12 }}>
              <div className="dbp-sk dbp-sk-avatar" style={{ width: 36, height: 36 }} />
              <div style={{ flex: 1 }}>
                <div className="dbp-sk dbp-sk-line" style={{ width: '70%', marginBottom: 6 }} />
                <div className="dbp-sk dbp-sk-line" style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

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
              <div className="dbp-revenue-amount">₹0</div>
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
                  <Bar dataKey="active" name="Active" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#C1DAFF" radius={[4, 4, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Active Doctors */}
          <div className="dbp-chart-card" style={{ marginTop: 16 }}>
            <h3 className="dbp-chart-title">Today's Active Doctors</h3>
            <div className="dbp-doctors-grid">
              {activeDoctors.map((d, i) => (
                <div key={i} className="dbp-doctor-card" onClick={() => onViewDoctor?.(d.raw as unknown as DoctorDetail)} style={{ cursor: onViewDoctor ? 'pointer' : 'default' }}>
                  <div className="dbp-doctor-top">
                    <img src={d.avatar} alt={d.name} className="dbp-doctor-avatar" onError={e => { (e.target as HTMLImageElement).src = doctorProfileImg }} />
                    <div className="dbp-doctor-info">
                      <span className="dbp-doctor-name">{d.name}</span>
                      <span className="dbp-doctor-specialty">{d.specialty}</span>
                    </div>
                  </div>
                  <div className="dbp-doctor-bottom">
                    {(() => {
                      const parts = d.session.split('–').map(s => s.trim())
                      const ended = parts.length === 2 && (new Date().getHours() * 60 + new Date().getMinutes()) > parse12h(parts[1])
                      return ended
                        ? <span className="dbp-doctor-unavailable">Not available today</span>
                        : <div className="dbp-doctor-session-row">
                          <div>
                            <span className="dbp-doctor-session-label">Time:</span>
                            <span className="dbp-doctor-session">{d.session}</span>
                          </div>
                          <DoctorStatus session={d.session} />
                        </div>
                    })()}
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
            {(data?.todayAppointments ?? []).length === 0
              ? <p style={{ fontSize: 13, color: '#494F5A' }}>No appointments today.</p>
              : (data?.todayAppointments ?? []).map(a => (
                <div key={a.id} className="dbp-apt-item">
                  <img src={userProfileImg} alt={a.patient.name} className="dbp-apt-avatar" />
                  <div className="dbp-apt-info">
                    <span className="dbp-apt-name">{a.patient.name}</span>
                    <span className="dbp-apt-time">{a.doctor.name}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
