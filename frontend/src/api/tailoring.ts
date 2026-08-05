import { api } from './client'
import type { TailoredResumeContent, TailoringStatus } from '../types'

export const tailoringApi = {
  trigger: (jobId: number) =>
    api.post<{ job_id: number; status: string }>(`/jobs/${jobId}/tailor`),
  status: (jobId: number) => api.get<TailoringStatus>(`/jobs/${jobId}/tailoring-status`),
  updateResume: (jobId: number, resume: TailoredResumeContent) =>
    api.put<{ ok: boolean; warnings: string[] }>(`/jobs/${jobId}/resume`, { resume }),
  updateCoverLetter: (jobId: number, body_text: string) =>
    api.put<{ ok: boolean }>(`/jobs/${jobId}/cover-letter`, { body_text }),
  resumePdfUrl: (jobId: number) => `/api/jobs/${jobId}/resume.pdf`,
  coverLetterPdfUrl: (jobId: number) => `/api/jobs/${jobId}/cover-letter.pdf`,
}
