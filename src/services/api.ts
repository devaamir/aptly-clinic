import axios from 'axios'
import type { LoginResponse, AppointmentsResponse, ContextsResponse, SwitchContextResponse, DoctorScheduleResponse, DoctorsResponse, GetDoctorResponse, SpecialtiesResponse, MedicalSystemsResponse, QualificationsResponse, CreateDoctorResponse, PatientsResponse, QueueSSEData, DoctorsListResponse, PatientSearchResponse, CreateAppointmentRequest, CreateAppointmentResponse } from './types'

export type { LoginResponse, AppointmentsResponse, ContextsResponse, SwitchContextResponse, DoctorScheduleResponse, DoctorsResponse, GetDoctorResponse, SpecialtiesResponse, MedicalSystemsResponse, QualificationsResponse, CreateDoctorResponse, PatientsResponse, QueueSSEData, DoctorsListResponse, PatientSearchResponse, CreateAppointmentRequest, CreateAppointmentResponse }
export * from './types'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

export const login = (emailAddress: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { emailAddress, password })

export const getAppointments = (page = 1, limit = 20) =>
  api.get<AppointmentsResponse>(`/appointments/medical-center?page=${page}&limit=${limit}`)

export const createAppointment = (body: CreateAppointmentRequest) =>
  api.post<CreateAppointmentResponse>('/appointments', body)

export const getContexts = () => api.get<ContextsResponse>('/auth/contexts')

export const switchContext = (role: string, medicalCenterId: string) =>
  api.post<SwitchContextResponse>('/auth/switch-context', {
    role,
    medicalCenterId,
    refreshToken: localStorage.getItem('refreshToken'),
  })

export const getPatients = () => api.get<PatientsResponse>('/patients')

export const searchPatients = (phoneNumber: string) =>
  api.get<PatientSearchResponse>(`/patients?phoneNumber=${encodeURIComponent(phoneNumber)}`)

export const createPatient = (body: import('./types').CreatePatientRequest) =>
  api.post<import('./types').CreatePatientResponse>('/patients', body)

export const getDoctors = () => api.get<DoctorsResponse>('/doctors/medical-center')

export const getDoctorsList = (params: { search?: string; page?: number; limit?: number } = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.page != null) query.set('page', String(params.page))
  if (params.limit != null) query.set('limit', String(params.limit))
  const qs = query.toString()
  return api.get<DoctorsListResponse>(`/doctors${qs ? `?${qs}` : ''}`)
}

export const getDoctor = (id: string) => api.get<GetDoctorResponse>(`/doctors/${id}`)

export const getSpecialties = () => api.get<SpecialtiesResponse>('/metadata/specialties')

export const getMedicalSystems = () => api.get<MedicalSystemsResponse>('/metadata/medical-systems')

export const getQualifications = () => api.get<QualificationsResponse>('/metadata/qualifications')

export const createDoctor = (body: import('./types').CreateDoctorRequest | FormData) =>
  body instanceof FormData
    ? client.post<CreateDoctorResponse>('/doctors', body, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
    : api.post<CreateDoctorResponse>('/doctors', body)

export const updateDoctor = (doctorId: string, body: import('./types').UpdateDoctorRequest | FormData) =>
  body instanceof FormData
    ? client.patch<CreateDoctorResponse>(`/doctors/${doctorId}`, body, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
    : api.patch<CreateDoctorResponse>(`/doctors/${doctorId}`, body)

export const deleteDoctor = (doctorId: string, medicalCenterId: string) =>
  client.delete<{ success: boolean }>(`/doctors/${doctorId}/medical-center`, { data: {} }).then(r => r.data)

export const updateDoctorSchedule = (doctorId: string, body: import('./types').UpdateScheduleRequest) =>
  api.post<import('./types').UpdateScheduleResponse>(`/doctors/${doctorId}/schedule`, body)

// SSE
import { EventSourcePolyfill } from 'event-source-polyfill'

export const createSSE = (endpoint: string, onMessage: (data: unknown) => void, onError?: (e: Event) => void): EventSource => {
  const token = localStorage.getItem('accessToken')
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${base}${path}`
  const es = new EventSourcePolyfill(url, {
    headers: { Authorization: `Bearer ${token}` },
  }) as unknown as EventSource
  es.onmessage = e => {
    try {
      console.log(e.data);
      onMessage(JSON.parse(e.data))
    } catch {
      console.log(e.data);
      onMessage(e.data)
    }
  }
  if (onError) es.onerror = onError
  return es
}

export const getDoctorSchedule = (doctorId: string, date: string, medicalCenterId: string) =>
  api.get<DoctorScheduleResponse>(`/doctors/${doctorId}/schedule?date=${date}&medicalCenterId=${medicalCenterId}`)

export const subscribeQueue = (doctorScheduleId: string, onData: (data: QueueSSEData) => void, onError?: (e: Event) => void): EventSource =>
  createSSE(`/appointments/queue?doctorScheduleId=${doctorScheduleId}`, onData as (d: unknown) => void, onError)

export const updateAppointmentStatus = (appointmentId: string, tokenStatus: 'pending' | 'done' | 'cancelled' | 'skipped' | 'ongoing') =>
  api.patch<{ success: boolean }>(`/appointments/${appointmentId}/status`, { tokenStatus })

export const pauseSchedule = (scheduleId: string, body: { date: string; startTime: string; stopTime: string }) =>
  api.post<import('./types').PauseScheduleResponse>(`/doctors/schedules/${scheduleId}/pause`, body)

export const cancelSchedulePause = (pauseId: string) =>
  api.patch<import('./types').PauseScheduleResponse>(`/doctors/schedules/pauses/${pauseId}/cancel`, {})

export const setPassword = (token: string, password: string) =>
  api.post<{ success: boolean }>('/auth/set-password', { token, password })

export const createClinic = (body: FormData) =>
  client.post<import('./types').CreateClinicResponse>('/clinics', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export interface DashboardData {
  todayAppointmentCounts: { confirmedCount: number; cancelledCount: number }
  monthlyAppointments: { currentCount: number; previousCount: number; growthPercentage: number }
  patients: { currentCount: number; previousCount: number; growthPercentage: number }
  yearlyAppointments: { month: string; confirmedCount: number; cancelledCount: number }[]
  todayDoctors: {
    id: string
    name: string
    profilePicture: string | null
    specialties: { id: string; name: string }[]
    schedules: { id: string; dayOfWeek: string; startTime: string; stopTime: string }[]
  }[]
  todayAppointments: {
    id: string
    patient: { id: string; name: string }
    doctor: { id: string; name: string }
  }[]
}

export const getDashboard = (medicalCenterId: string) =>
  api.get<{ success: boolean; data: DashboardData }>(`/ui/dashboard?medicalCenterId=${medicalCenterId}`)

export const updateClinic = (body: FormData) =>
  client.patch<{ success: boolean; data: import('./types').ClinicData }>('/clinics/me', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
