import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach access token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401 with token refresh
client.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, { refreshToken })
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return client(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export const api = {
  get: <T>(endpoint: string) => client.get<T>(endpoint).then(r => r.data),
  post: <T>(endpoint: string, body: unknown) => client.post<T>(endpoint, body).then(r => r.data),
  put: <T>(endpoint: string, body: unknown) => client.put<T>(endpoint, body).then(r => r.data),
  patch: <T>(endpoint: string, body: unknown) => client.patch<T>(endpoint, body).then(r => r.data),
  delete: <T>(endpoint: string) => client.delete<T>(endpoint).then(r => r.data),
}

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

export const login = (emailAddress: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { emailAddress, password })

// Appointments
export interface Speciality { id: string; name: string; description: string; icon: string; createdAt: string; updatedAt: string }
export interface Qualification { id: string; name: string; createdAt: string; updatedAt: string }
export interface MedicalSystem { id: string; name: string; description: string; createdAt: string; updatedAt: string }
export interface AppointmentDoctor {
  id: string; name: string; phoneNumber: string; emailAddress: string; yearsOfExperience: number
  advanceBookingLimit: number; estimateConsultationTime: number; latitude: number; longitude: number
  address: string; district: string; state: string; country: string; about: string
  consultationFee: number; profilePicture: string; createdAt: string; updatedAt: string
  specialities: Speciality[]; medicalSystem: MedicalSystem; qualifications: Qualification[]
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
export interface AppointmentMedicalCenter {
  id: string; name: string; type: string; phoneNumber: string; emailAddress: string
  latitude: number; longitude: number; address: string; district: string; state: string
  country: string; about: string; alternatePhoneNumber: string; websiteUrl: string
  profilePicture: string; createdAt: string; updatedAt: string
}
export interface Appointment {
  id: string; referenceId: string; tokenNumber: number; appointmentDate: string
  tokenStatus: string; creatorRole: string; cancellerRole: string; createdAt: string; updatedAt: string
  doctor: AppointmentDoctor; patient: AppointmentPatient
  creator: AppointmentUser; canceller: AppointmentUser
  schedule: AppointmentSchedule; medicalCenter: AppointmentMedicalCenter
}
export interface AppointmentsResponse { success: boolean; data: Appointment[] }

export const getAppointments = () => api.get<AppointmentsResponse>('/appointments')
