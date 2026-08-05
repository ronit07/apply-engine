import { useNavigate } from 'react-router-dom'
import type { Job } from '../../types'

export function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60"
    >
      <div className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {job.role_title}
      </div>
      <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{job.company}</div>
    </button>
  )
}
