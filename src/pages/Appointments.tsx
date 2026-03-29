import type { FC } from 'react'
import PageHeader from '../components/PageHeader'
import addIcon from '../assets/icons/add-icon-white.svg'
import './Appointments.css'

const Appointments: FC = () => (
  <div className="apt-container">
    <PageHeader
      title="Appointments"
      actions={
        <button className="apt-schedule-btn">
          <img src={addIcon} alt="" style={{ width: 16, height: 16 }} />
          Schedule Appointment
        </button>
      }
    />
  </div>
)

export default Appointments
