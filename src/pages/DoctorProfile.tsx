import type { FC } from 'react'
import { useState } from 'react'
import Badge from '../components/Badge'
import { appointments, statusProps as aptStatusProps, bookingProps } from '../data/appointments'
import patientsGreenIcon from '../assets/icons/patients-green-icon.svg'
import patientsRedIcon from '../assets/icons/patients-red-icon.svg'
import clockBlueIcon from '../assets/icons/clock-blue-icon.svg'
import qualificationIcon from '../assets/icons/qualification-icon.svg'
import experienceIcon from '../assets/icons/experience-icon.svg'
import phoneIcon from '../assets/icons/phone-icon-grey.svg'
import emailIcon from '../assets/icons/email-icon.svg'
import buildingIcon from '../assets/icons/building-icon.svg'
import dollarIcon from '../assets/icons/dollar-icon.svg'
import './DoctorProfile.css'

interface Doctor {
  id: string
  name: string
  avatar: string
  specialty: string
  phone: string
  email: string
  experience: string
  status: 'Active' | 'Inactive'
}

const statusProps = {
  Active: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Inactive: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
}

interface DoctorProfileProps {
  doctor: Doctor
  onBack: () => void
}

const DoctorProfile: FC<DoctorProfileProps> = ({ doctor, onBack }) => {
  const doctorApts = appointments.filter(a => a.doctor === doctor.name)
  const [activeTab, setActiveTab] = useState<'Overview' | 'Schedule' | 'Leaves' | 'Documents'>('Overview')

  return (
    <div className="dp-container">
      <div className="dp-body">
        {/* Profile Card */}
        <div className="dp-profile-card">
          <img src={doctor.avatar} alt={doctor.name} className="dp-avatar" />
          <div className="dp-profile-info">
            <div className="dp-name-row">
              <span className="dp-name">{doctor.name}</span>
              <Badge text={doctor.status} {...statusProps[doctor.status]} />
            </div>
            <span className="dp-specialty">{doctor.specialty}</span>
            <div className="dp-info-row">
              {[
                { icon: qualificationIcon, value: 'MBBS, MD' },
                { icon: experienceIcon, value: doctor.experience },
                { icon: phoneIcon, value: doctor.phone },
              ].map((item, i) => (
                <div key={i} className="dp-info-item">
                  <img src={item.icon} alt="" />
                  <span className="dp-info-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="dp-info-row">
              {[
                { icon: emailIcon, value: doctor.email },
                { icon: buildingIcon, value: 'Full Time' },
                { icon: dollarIcon, value: '₹500' },
              ].map((item, i) => (
                <div key={i} className="dp-info-item">
                  <img src={item.icon} alt="" />
                  <span className="dp-info-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="dp-meta-text">
              Doctor ID: {doctor.id} &bull; Joined Mar 15, 2018
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dp-tabs">
          {(['Overview', 'Schedule', 'Leaves', 'Documents'] as const).map(tab => (
            <button key={tab} className={`dp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <div className="dp-overview">
            {/* Left 70% */}
            <div className="dp-overview-left">
              <div className="dp-stats-row">
                {[
                  { label: 'Monthly Patients', value: '124', icon: patientsGreenIcon },
                  { label: 'Total Patients', value: '1,840', icon: patientsRedIcon },
                  { label: 'Avg Time / Patient', value: '18 min', icon: clockBlueIcon },
                ].map(s => (
                  <div key={s.label} className="dp-stat-card">
                    <img src={s.icon} alt="" style={{ width: 20, height: 20, marginBottom: 8 }} />
                    <span className="dp-stat-value">{s.value}</span>
                    <span className="dp-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 30% */}
            <div className="dp-overview-right">
              <div className="dp-schedule-card">
                <div className="dp-schedule-title">This Week's Schedule</div>
                {[
                  { day: 'Mon', sessions: ['9:00 AM – 1:00 PM', '2:00 PM – 4:00 PM'] },
                  { day: 'Tue', sessions: ['9:00 AM – 1:00 PM'] },
                  { day: 'Wed', sessions: [] },
                  { day: 'Thu', sessions: ['9:00 AM – 1:00 PM', '2:00 PM – 4:00 PM'] },
                  { day: 'Fri', sessions: ['9:00 AM – 1:00 PM'] },
                  { day: 'Sat', sessions: [] },
                  { day: 'Sun', sessions: [] },
                ].map((item, i, arr) => (
                  <div key={item.day}>
                    <div className={`dp-schedule-row ${item.sessions.length === 0 ? 'dp-schedule-row-off' : ''}`}>
                      <span className="dp-schedule-day">{item.day}</span>
                      <div className="dp-schedule-sessions">
                        {item.sessions.length === 0
                          ? <span className="dp-schedule-off">Off</span>
                          : item.sessions.map(s => <span key={s} className="dp-schedule-session">{s}</span>)
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Schedule' && <div className="dp-tab-placeholder">Schedule content coming soon.</div>}
        {activeTab === 'Leaves' && <div className="dp-tab-placeholder">Leaves content coming soon.</div>}
        {activeTab === 'Documents' && <div className="dp-tab-placeholder">Documents content coming soon.</div>}
      </div>
    </div>
  )
}

export default DoctorProfile
