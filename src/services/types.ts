// Auth
export interface LoginResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      name: string
      phoneNumber: string
      emailAddress: string
      createdAt: string
      updatedAt: string
      role: string
      medicalCenterId: string
    }
  }
}

// Appointments
export interface Speciality { id: string; name: string; description: string; icon: string; createdAt: string; updatedAt: string }
export interface Qualification { id: string; name: string; createdAt: string; updatedAt: string }
export interface MedicalSystem { id: string; name: string; description: string; createdAt: string; updatedAt: string }
export interface AppointmentDoctor {
  id: string; name: string; referenceId: string; phoneNumber: string; emailAddress: string; yearsOfExperience: number
  advanceBookingLimit: number; estimateConsultationTime: number; latitude: number; longitude: number
  address: string; district: string; state: string; country: string; about: string
  consultationFee: number; profilePicture: string; createdAt: string; updatedAt: string
  specialties: Speciality[]; medicalSystem: MedicalSystem; qualifications: Qualification[]
}
export interface AppointmentPatient {
  id: string; name: string; referenceId: string; phoneNumber: string
  gender: string; dateOfBirth: string; createdAt: string; updatedAt: string; deletedAt: null | string
}
export interface AppointmentUser { id: string; name: string; phoneNumber: string; emailAddress: string; createdAt: string; updatedAt: string }
export interface AppointmentSchedule {
  id: string; dayOfWeek: string; startTime: string; stopTime: string
  tokenLimit: number; createdAt: string; updatedAt: string
}
export interface Appointment {
  id: string; referenceId: string; tokenNumber: number; appointmentDate: string
  tokenStatus: string; creatorRole: string; cancellerRole: string; createdAt: string; updatedAt: string
  doctor: AppointmentDoctor; patient: AppointmentPatient
  creator: AppointmentUser; canceller: AppointmentUser
  schedule: AppointmentSchedule
}
export interface Pagination {
  totalItems: number; totalPages: number; currentPage: number; limit: number; hasNextPage: boolean
}
export interface AppointmentsResponse { success: boolean; data: Appointment[]; pagination: Pagination }

// Auth Contexts
export interface MedicalCenterCreator { id: string; name: string; phoneNumber: string; emailAddress: string; createdAt: string; updatedAt: string }
export interface UserMedicalCenter {
  id: string; name: string; type: string; phoneNumber: string; emailAddress: string
  latitude: number; longitude: number; address: string; district: string; state: string
  country: string; about: string; alternatePhoneNumber: string; websiteUrl: string
  profilePicture: string; createdAt: string; updatedAt: string
  creator: MedicalCenterCreator
}
export interface UserContext { role: string; medicalCenter: UserMedicalCenter }
export interface ContextsResponse { success: boolean; data: UserContext[] }

// Switch Context
export interface SwitchContextResponse {
  success: boolean
  message: string
  data: { accessToken: string; refreshToken: string }
}

// Patients
export interface Patient {
  id: string; name: string; referenceId: string; phoneNumber: string
  gender: string; dateOfBirth: string; createdAt: string; updatedAt: string; deletedAt: null | string
  creator: AppointmentUser; creatorRole: string
}
export interface PatientsResponse { success: boolean; data: Patient[] }

// Doctors
export interface DoctorsResponse { success: boolean; data: AppointmentDoctor[] }

// Doctor Schedule
export interface DoctorSchedule {
  id: string; dayOfWeek: string; startTime: string; stopTime: string
  tokenLimit: number; createdAt: string; updatedAt: string; remainingTokenCount: number
}
export interface DoctorScheduleResponse { success: boolean; data: DoctorSchedule[] }

// Queue SSE
export interface QueueAppointment {
  tokenNumber: number
  tokenStatus: string
  createdAt: string
  updatedAt: string
  patient: { name: string; phoneNumber: string; gender: string; dateOfBirth: string }
  doctor: { estimateConsultationTime: number }
}
export interface ActivePause {
  id: string; date: string; startTime: string; stopTime: string
  status: string; createdAt: string; updatedAt: string
}
export interface QueueSSEData {
  appointments: QueueAppointment[]
  activePauses: ActivePause[]
}
