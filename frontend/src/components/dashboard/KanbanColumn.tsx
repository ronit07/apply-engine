import type { Job, JobStatus } from '../../types'
import { STATUS_LABELS } from '../common/StatusBadge'
import { JobCard } from './JobCard'

export function KanbanColumn({ status, jobs }: { status: JobStatus; jobs: Job[] }) {
  return (
    <div className="flex min-w-64 flex-1 flex-col rounded-xl bg-neutral-100/70 p-3 dark:bg-neutral-900/60">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {STATUS_LABELS[status]}
        </span>
        <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {jobs.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 px-3 py-6 text-center text-xs text-neutral-400 dark:border-neutral-700 dark:text-neutral-600">
            No jobs here yet
          </div>
        )}
      </div>
    </div>
  )
}
