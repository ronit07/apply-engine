import { useState } from 'react'
import type { JobCreatePayload } from '../../api/jobs'

interface JobFormProps {
  onSubmit: (payload: JobCreatePayload) => void
  submitting: boolean
  error?: string
}

export function JobForm({ onSubmit, submitting, error }: JobFormProps) {
  const [mode, setMode] = useState<'text' | 'url'>('text')
  const [company, setCompany] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [jdText, setJdText] = useState('')
  const [url, setUrl] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          company,
          role_title: roleTitle,
          jd_text: mode === 'text' ? jdText : undefined,
          url: mode === 'url' ? url : undefined,
        })
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Company
          </span>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Role title
          </span>
          <input
            required
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Software Engineer"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </label>
      </div>

      <div className="flex gap-1 rounded-md bg-neutral-100 p-1 text-sm dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
            mode === 'text'
              ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          Paste JD text
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
            mode === 'url'
              ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          Paste URL
        </button>
      </div>

      {mode === 'text' ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Job description
          </span>
          <textarea
            required
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={10}
            placeholder="Paste the full job description here…"
            className="resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Job posting URL
          </span>
          <input
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://jobs.example.com/posting/123"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </label>
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {submitting ? 'Adding…' : 'Add job'}
      </button>
    </form>
  )
}
