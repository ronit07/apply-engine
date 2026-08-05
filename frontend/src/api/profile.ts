import { api } from './client'
import type { Profile } from '../types'

export type ProfileUpdatePayload = Omit<
  Profile,
  'id' | 'resume_original_filename' | 'resume_raw_text' | 'resume_uploaded_at'
>

export const profileApi = {
  get: () => api.get<Profile>('/profile'),
  update: (payload: ProfileUpdatePayload) => api.put<Profile>('/profile', payload),
  uploadResume: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.postForm<Profile>('/profile/resume', form)
  },
}
