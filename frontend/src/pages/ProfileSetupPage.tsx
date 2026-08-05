import { TopBar } from '../components/layout/TopBar'
import { ProfileForm } from '../components/profile/ProfileForm'
import { ResumeUpload } from '../components/profile/ResumeUpload'
import { useProfile, useUpdateProfile, useUploadResume } from '../hooks/useProfile'

export function ProfileSetupPage() {
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadResume = useUploadResume()

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <TopBar title="Profile" subtitle="Your contact info and source resume feed every tailored application." />
      <div className="flex max-w-2xl flex-col gap-6 p-8">
        <ResumeUpload
          profile={profile}
          uploading={uploadResume.isPending}
          onUpload={(file) => uploadResume.mutate(file)}
        />
        <ProfileForm
          profile={profile}
          saving={updateProfile.isPending}
          onSave={(payload) => updateProfile.mutate(payload)}
        />
        {updateProfile.isSuccess && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Saved.</p>
        )}
      </div>
    </div>
  )
}
