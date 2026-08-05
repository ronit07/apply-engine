import { api } from './client'
import type { Job, JobDetail, JobStatus } from '../types'

export interface JobCreatePayload {
  company: string
  role_title: string
  url?: string
  jd_text?: string
}

export const jobsApi = {
  list: (status?: JobStatus) =>
    api.get<Job[]>(`/jobs${status ? `?status=${status}` : ''}`),
  get: (id: number) => api.get<JobDetail>(`/jobs/${id}`),
  create: (payload: JobCreatePayload) => api.post<Job>('/jobs', payload),
  remove: (id: number) => api.delete<void>(`/jobs/${id}`),
  setStatus: (id: number, status: JobStatus) =>
    api.put<{ ok: boolean; status: string }>(`/jobs/${id}/status`, { status }),
}
