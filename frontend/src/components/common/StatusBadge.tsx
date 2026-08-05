import type { JobStatus } from '../../types'

const STATUS_STYLES: Record<JobStatus, string> = {
  SOURCED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  TAILORING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  READY_FOR_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  APPLIED: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  EMAILED: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  INTERVIEW: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  OFFER: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const STATUS_LABELS: Record<JobStatus, string> = {
  SOURCED: 'Sourced',
  TAILORING: 'Tailoring…',
  READY_FOR_REVIEW: 'Ready for review',
  APPROVED: 'Approved',
  APPLIED: 'Applied',
  EMAILED: 'Emailed',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
}

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export const KANBAN_COLUMNS: JobStatus[] = [
  'SOURCED',
  'TAILORING',
  'READY_FOR_REVIEW',
  'APPROVED',
]

export { STATUS_LABELS }
