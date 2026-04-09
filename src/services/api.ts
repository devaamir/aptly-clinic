import axios from 'axios'
import type { LoginResponse, AppointmentsResponse, ContextsResponse, SwitchContextResponse } from './types'

export type { LoginResponse, AppointmentsResponse, ContextsResponse, SwitchContextResponse }
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

export const getContexts = () => api.get<ContextsResponse>('/auth/contexts')

export const switchContext = (role: string, medicalCenterId: string) =>
  api.post<SwitchContextResponse>('/auth/switch-context', {
    role,
    medicalCenterId,
    refreshToken: localStorage.getItem('refreshToken'),
  })

export const getPatients = () => api.get<PatientsResponse>('/patients')
