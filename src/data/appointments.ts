export type AptStatus = 'Confirmed' | 'Completed' | 'Cancelled'
export type BookingMethod = 'Online' | 'Offline'

export interface Appointment {
  id: string
  patient: string
  avatar: string
  phone: string
  gender: string
  dob: string
  age: number
  date: string
  session: string
  token: string
  doctor: string
  doctorAvatar: string
  specialty: string
  bookingMethod: BookingMethod
  bookedDate?: string
  cancelledBy?: string
  cancelledOn?: string
  status: AptStatus
}

export const bookingProps: Record<BookingMethod, { bgColor: string; textColor: string; dotColor: string }> = {
  Online: { bgColor: '#F2F4F7', textColor: '#344054', dotColor: '#636A79' },
  Offline: { bgColor: '#FDF2FA', textColor: '#C11574', dotColor: '#EE46BC' },
}

export const statusProps: Record<AptStatus, { bgColor: string; textColor: string; dotColor: string }> = {
  Confirmed: { bgColor: '#ECFDF3', textColor: '#027A48', dotColor: '#12B76A' },
  Cancelled: { bgColor: '#FEF3F2', textColor: '#B42318', dotColor: '#F04438' },
  Completed: { bgColor: '#EEF4FF', textColor: '#3538CD', dotColor: '#6172F3' },
}

export const appointments: Appointment[] = [
  { id: 'APT001', patient: 'Katie Sims', avatar: 'https://i.pravatar.cc/32?img=5', phone: '+91 90487 8290', gender: 'Female', dob: 'Jan 12, 1994', age: 32, date: 'Mar 30, 2026', session: '09:00 AM', token: '01', doctor: 'Dr. Daniel Hamilton', doctorAvatar: 'https://i.pravatar.cc/32?img=2', specialty: 'Cardiology', bookingMethod: 'Online', status: 'Confirmed' },
  { id: 'APT002', patient: 'Ricky Smith', avatar: 'https://i.pravatar.cc/32?img=6', phone: '+91 90487 8291', gender: 'Male', dob: 'Mar 5, 1981', age: 45, date: 'Mar 30, 2026', session: '09:30 AM', token: '02', doctor: 'Dr. Sarah Johnson', doctorAvatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Confirmed' },
  { id: 'APT003', patient: 'Autumn Phillips', avatar: 'https://i.pravatar.cc/32?img=7', phone: '+91 90487 8292', gender: 'Female', dob: 'Jul 22, 1998', age: 28, date: 'Mar 30, 2026', session: '10:00 AM', token: '03', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Online', status: 'Cancelled', cancelledBy: 'Clinic', cancelledOn: 'Mar 29, 2026' },
  { id: 'APT004', patient: 'Jerry Helfer', avatar: 'https://i.pravatar.cc/32?img=8', phone: '+91 90487 8293', gender: 'Male', dob: 'Sep 3, 1988', age: 38, date: 'Mar 30, 2026', session: '10:30 AM', token: '04', doctor: 'Dr. Daniel Hamilton', doctorAvatar: 'https://i.pravatar.cc/32?img=2', specialty: 'Cardiology', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Completed' },
  { id: 'APT005', patient: 'Rodger Struck', avatar: 'https://i.pravatar.cc/32?img=9', phone: '+91 90487 8294', gender: 'Male', dob: 'Feb 14, 1974', age: 52, date: 'Mar 30, 2026', session: '11:00 AM', token: '05', doctor: 'Dr. Sarah Johnson', doctorAvatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', bookingMethod: 'Online', status: 'Confirmed' },
  { id: 'APT006', patient: 'Bradley Lawlor', avatar: 'https://i.pravatar.cc/32?img=10', phone: '+91 90487 8295', gender: 'Male', dob: 'Nov 30, 1984', age: 41, date: 'Mar 30, 2026', session: '11:30 AM', token: '06', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Confirmed' },
  { id: 'APT007', patient: 'Bradley Lawlor', avatar: 'https://i.pravatar.cc/32?img=10', phone: '+91 90487 8295', gender: 'Male', dob: 'Nov 30, 1984', age: 41, date: 'Mar 30, 2026', session: '11:30 AM', token: '06', doctor: 'Dr. Michael Chen', doctorAvatar: 'https://i.pravatar.cc/32?img=4', specialty: 'Orthopedics', bookingMethod: 'Offline', bookedDate: 'Mar 27, 2026', status: 'Confirmed' },
  { id: 'APT008', patient: 'Katie Sims', avatar: 'https://i.pravatar.cc/32?img=5', phone: '+91 90487 8290', gender: 'Female', dob: 'Jan 12, 1994', age: 32, date: 'Mar 28, 2026', session: '09:00 AM', token: '08', doctor: 'Dr. Sarah Johnson', doctorAvatar: 'https://i.pravatar.cc/32?img=1', specialty: 'Cardiology', bookingMethod: 'Online', bookedDate: 'Mar 25, 2026', status: 'Completed' },
]
