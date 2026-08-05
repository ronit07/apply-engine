import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tailoringApi } from '../api/tailoring'
import type { TailoredResumeContent } from '../types'

export function useTailoringStatus(jobId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['tailoring-status', jobId],
    queryFn: () => tailoringApi.status(jobId),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.overall_status === 'running' ? 1500 : false,
  })
}

export function useTriggerTailoring(jobId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tailoringApi.trigger(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tailoring-status', jobId] })
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
    },
  })
}

export function useUpdateResume(jobId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resume: TailoredResumeContent) => tailoringApi.updateResume(jobId, resume),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
  })
}

export function useUpdateCoverLetter(jobId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bodyText: string) => tailoringApi.updateCoverLetter(jobId, bodyText),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
  })
}
