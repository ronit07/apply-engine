export interface Profile {
  id: number
  full_name: string
  email: string
  phone: string
  location: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
  resume_original_filename: string | null
  resume_raw_text: string | null
  resume_uploaded_at: string | null
}

export type JobStatus =
  | 'SOURCED'
  | 'TAILORING'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'APPLIED'
  | 'EMAILED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export interface Job {
  id: number
  company: string
  role_title: string
  url: string | null
  jd_text: string
  jd_source_type: string
  status: JobStatus
  created_at: string
  updated_at: string
}

export interface ExperienceEntry {
  company: string
  title: string
  location?: string
  start_date?: string
  end_date?: string
  bullets: string[]
}

export interface ProjectEntry {
  name: string
  dates?: string
  bullets: string[]
}

export interface EducationEntry {
  school: string
  degree?: string
  dates?: string
  details?: string
}

export interface TailoredResumeContent {
  summary: string
  skills: string[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  certifications: string[]
}

export interface TailoredResume {
  id: number
  job_id: number
  resume: TailoredResumeContent
  warnings: string[]
  pdf_path: string | null
  is_edited: boolean
  created_at: string
}

export interface CoverLetter {
  id: number
  job_id: number
  body_text: string
  pdf_path: string | null
  is_edited: boolean
  created_at: string
}

export interface TailoringRun {
  id: number
  run_type: string
  status: 'pending' | 'running' | 'succeeded' | 'failed'
  error_message: string | null
  estimated_cost_usd: number | null
  started_at: string | null
  completed_at: string | null
}

export interface TailoringStatus {
  job_id: number
  job_status: string
  runs: TailoringRun[]
  overall_status: 'idle' | 'running' | 'succeeded' | 'failed'
}

export interface JobDetail extends Job {
  tailored_resume: TailoredResume | null
  cover_letter: CoverLetter | null
  latest_runs: TailoringRun[]
}
