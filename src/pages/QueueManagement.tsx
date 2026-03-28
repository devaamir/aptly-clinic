import type { FC } from 'react'
import { useState } from 'react'
import searchIcon from '../assets/icons/search-icon.svg'
import upDownArrow from '../assets/icons/up-down-arrow.svg'
import sortIcon from '../assets/icons/sort-icon.svg'
import settingsIconsIcon from '../assets/icons/settings-icons.svg'
import reloadIcon from '../assets/icons/reload-icon.svg'
import listIcon from '../assets/icons/list-icon.svg'
import gridIcon from '../assets/icons/grid-icon.svg'
import instantPauseIcon from '../assets/icons/instant-pause.svg'
import scheduledPauseIcon from '../assets/icons/scheduled-pause.svg'
import skipIcon from '../assets/icons/skip-icon.svg'
import rightArrow from '../assets/icons/right-arrow.svg'
import phoneIcon from '../assets/icons/phone-icon.svg'
import dotsIcon from '../assets/icons/3dots-icon.svg'
import Badge from '../components/Badge'
import './QueueManagement.css'

const statusBadgeProps: Record<Status, { bgColor: string; textColor: string; dotColor: string }> = {
  Completed: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Skipped:   { bgColor: '#FFFAEB', textColor: '#B54708', dotColor: '#F79009' },
  Current:   { bgColor: '#EFF8FF', textColor: '#175CD3', dotColor: '#2E90FA' },
  Waiting:   { bgColor: '#F8F9FB', textColor: '#636A79', dotColor: '#98A2B3' },
  Cancelled: { bgColor: '#FEF3F2', textColor: '#B42318', dotColor: '#F04438' },
}

type Status = 'Completed' | 'Skipped' | 'Current' | 'Waiting' | 'Cancelled'

interface Patient {
  token: string
  name: string
  phone: string
  arrival: string
  status: Status
  avatar: string
}

interface Doctor {
  id: number
  name: string
  specialty: string
  room: string
  avatar: string
  workingTime: string
  totalPatient: number
  completedPatient: number
  avgInterval: string
  isLive: boolean
  patients: Patient[]
}

const doctors: Doctor[] = [
  {
    id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', room: 'Room 100',
    avatar: 'https://i.pravatar.cc/40?img=1', workingTime: '9:00am - 1:00pm',
    totalPatient: 60, completedPatient: 3, avgInterval: '8 minutes', isLive: false,
    patients: [
      { token: '01', name: 'Alice Brown', phone: '+91 90487 1111', arrival: '09:00 AM', status: 'Completed', avatar: 'https://i.pravatar.cc/32?img=20' },
      { token: '02', name: 'Bob Martin', phone: '+91 90487 2222', arrival: '09:15 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=21' },
      { token: '03', name: 'Carol White', phone: '+91 90487 3333', arrival: '09:30 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=22' },
    ],
  },
  {
    id: 2, name: 'Dr. Daniel Hamilton', specialty: 'Cardiology', room: 'Room 101',
    avatar: 'https://i.pravatar.cc/40?img=2', workingTime: '8:00am - 11:30am',
    totalPatient: 84, completedPatient: 5, avgInterval: '5 minutes', isLive: true,
    patients: [
      { token: '01', name: 'Katie Sims', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Completed', avatar: 'https://i.pravatar.cc/32?img=5' },
      { token: '02', name: 'Ricky Smith', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Completed', avatar: 'https://i.pravatar.cc/32?img=6' },
      { token: '03', name: 'Autumn Phillips', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Skipped', avatar: 'https://i.pravatar.cc/32?img=7' },
      { token: '04', name: 'Jerry Helfer', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Current', avatar: 'https://i.pravatar.cc/32?img=8' },
      { token: '05', name: 'Rodger Struck', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=9' },
      { token: '06', name: 'Bradley Lawlor', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Cancelled', avatar: 'https://i.pravatar.cc/32?img=10' },
      { token: '07', name: 'Chris Glasser', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=11' },
      { token: '08', name: 'John Dukes', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=12' },
      { token: '09', name: 'Judith Rodriguez', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=13' },
      { token: '10', name: 'James Hall', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=14' },
      { token: '11', name: 'Kenneth Allen', phone: '+91 90487 8290', arrival: '09:00 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=15' },
    ],
  },
  {
    id: 3, name: 'Dr. Daniel Hamilton', specialty: 'Neurology', room: 'Room 102',
    avatar: 'https://i.pravatar.cc/40?img=3', workingTime: '10:00am - 2:00pm',
    totalPatient: 45, completedPatient: 2, avgInterval: '10 minutes', isLive: true,
    patients: [
      { token: '01', name: 'Mark Spencer', phone: '+91 90487 4444', arrival: '10:00 AM', status: 'Current', avatar: 'https://i.pravatar.cc/32?img=16' },
      { token: '02', name: 'Nina Patel', phone: '+91 90487 5555', arrival: '10:10 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=17' },
    ],
  },
  {
    id: 4, name: 'Dr. Michael Chen', specialty: 'Orthopedics', room: 'Room 103',
    avatar: 'https://i.pravatar.cc/40?img=4', workingTime: '11:00am - 3:00pm',
    totalPatient: 30, completedPatient: 0, avgInterval: '12 minutes', isLive: false,
    patients: [
      { token: '01', name: 'Leo Grant', phone: '+91 90487 6666', arrival: '11:00 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=18' },
      { token: '02', name: 'Sara Kim', phone: '+91 90487 7777', arrival: '11:15 AM', status: 'Waiting', avatar: 'https://i.pravatar.cc/32?img=19' },
    ],
  },
]


const QueueManagement: FC = () => {
  const [selectedId, setSelectedId] = useState(2)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const doctor = doctors.find(d => d.id === selectedId)!

  return (
    <div className="qm-container">
      {/* Header */}
      <div className="qm-header">
        <h1 className="qm-title">Queue Management</h1>
        <div className="qm-header-actions">
          <button className="qm-icon-btn"><img src={searchIcon} alt="search" /></button>
          <button className="qm-icon-btn"><img src={upDownArrow} alt="sort" /></button>
          <button className="qm-icon-btn"><img src={sortIcon} alt="filter" /></button>
          <button className="qm-icon-btn"><img src={settingsIconsIcon} alt="settings" /></button>
          <button className="qm-icon-btn"><img src={reloadIcon} alt="reload" /></button>
          <div className="view-toggle">
            <button className={`qm-icon-btn view-btn ${view === 'list' ? 'view-active' : ''}`} onClick={() => setView('list')}><img src={listIcon} alt="list" /></button>
            <button className={`qm-icon-btn view-btn ${view === 'grid' ? 'view-active' : ''}`} onClick={() => setView('grid')}><img src={gridIcon} alt="grid" /></button>
          </div>
        </div>
      </div>

      {/* Doctor Tabs */}
      <div className="qm-doctor-tabs">
        {doctors.map(doc => (
          <div
            key={doc.id}
            className={`qm-doctor-tab ${doc.id === selectedId ? 'active' : ''}`}
            onClick={() => setSelectedId(doc.id)}
          >
            <img src={doc.avatar} alt={doc.name} className="tab-avatar" />
            <span>{doc.name}</span>
          </div>
        ))}
      </div>

      {/* Main White Container */}
      <div className="qm-main-card">

        {/* Doctor Card */}
        <div className="qm-doctor-card">
          <div className="doctor-info">
            <img src={doctor.avatar} alt={doctor.name} className="doctor-avatar" />
            <div>
              <h2 className="doctor-name">{doctor.name}</h2>
              <p className="doctor-meta">{doctor.specialty} • {doctor.room}</p>
            </div>
            {doctor.isLive && <Badge text="Live" bgColor="#ECFDF3" textColor="#027A48" dotColor="#12B76A" />}
          </div>
          <div className="doctor-actions">
            <button className="action-btn"><img src={instantPauseIcon} alt="" className="btn-icon" /> Instant Pause</button>
            <button className="action-btn"><img src={scheduledPauseIcon} alt="" className="btn-icon" /> Scheduled Pause</button>
            <button className="action-btn"><img src={skipIcon} alt="" className="btn-icon" /> Skip</button>
            <button className="action-btn next-token">Next Token <img src={rightArrow} alt="" className="btn-icon" /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="qm-stats">
          <div className="stat-item">
            <span className="stat-label">Working Time</span>
            <span className="stat-value">{doctor.workingTime}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Patient</span>
            <span className="stat-value">{doctor.totalPatient}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed Patient</span>
            <span className="stat-value">{doctor.completedPatient}</span>
          </div>
          <div className="stat-item" style={{ borderRight: '0' }}>
            <span className="stat-label">Average Interval</span>
            <span className="stat-value">{doctor.avgInterval}</span>
          </div>
        </div>

        {/* Queue Table */}
        <div className="qm-table-wrapper">
          <table className="qm-table">
            <thead>
              <tr>
                <th>TOKEN</th>
                <th>PATIENT</th>
                <th>PHONE</th>
                <th>ARRIVAL</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {doctor.patients.map(p => (
                <tr key={p.token} className={p.status === 'Current' ? 'row-current' : ''}>
                  <td>
                    <span className={`token-badge ${p.status === 'Current' ? 'token-current' : ''}`}>
                      {p.token}
                    </span>
                  </td>
                  <td>
                    <div className="patient-cell">
                      <img src={p.avatar} alt={p.name} className="patient-avatar" />
                      {p.name}
                    </div>
                  </td>
                  <td>{p.phone}</td>
                  <td>{p.arrival}</td>
                  <td><Badge text={p.status} {...statusBadgeProps[p.status]} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="qm-icon-btn phone-btn"><img src={phoneIcon} alt="call" /></button>
                      <button className="qm-icon-btn dots-btn"><img src={dotsIcon} alt="more" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default QueueManagement
