import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi, type ProfileUpdatePayload } from '../api/profile'

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: profileApi.get })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => profileApi.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useUploadResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadResume(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })
}
