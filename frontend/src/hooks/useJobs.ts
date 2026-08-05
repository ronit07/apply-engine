import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobsApi, type JobCreatePayload } from '../api/jobs'
import type { JobStatus } from '../types'

export function useJobs(status?: JobStatus) {
  return useQuery({ queryKey: ['jobs', status ?? 'all'], queryFn: () => jobsApi.list(status) })
}

export function useJob(id: number) {
  return useQuery({ queryKey: ['job', id], queryFn: () => jobsApi.get(id), enabled: Number.isFinite(id) })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: JobCreatePayload) => jobsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useSetJobStatus(jobId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: JobStatus) => jobsApi.setStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
