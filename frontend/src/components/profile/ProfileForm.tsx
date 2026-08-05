import { useEffect, useState } from 'react'
import type { ProfileUpdatePayload } from '../../api/profile'
import type { Profile } from '../../types'

const FIELDS: { key: keyof ProfileUpdatePayload; label: string; placeholder: string }[] = [
  { key: 'full_name', label: 'Full name', placeholder: 'Jane Doe' },
  { key: 'email', label: 'Email', placeholder: 'jane@example.com' },
  { key: 'phone', label: 'Phone', placeholder: '(555) 123-4567' },
  { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
  { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/janedoe' },
  { key: 'github_url', label: 'GitHub', placeholder: 'https://github.com/janedoe' },
  { key: 'portfolio_url', label: 'Portfolio', placeholder: 'https://janedoe.dev' },
]

interface ProfileFormProps {
  profile?: Profile
  onSave: (payload: ProfileUpdatePayload) => void
  saving: boolean
}

export function ProfileForm({ profile, onSave, saving }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileUpdatePayload>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  })

  useEffect(() => {
    if (profile) {
      setValues({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
      })
    }
  }, [profile])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(values)
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {label}
            </span>
            <input
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              placeholder={placeholder}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  )
}
