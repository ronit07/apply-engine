import type { Job } from '../../types'
import { KANBAN_COLUMNS } from '../common/StatusBadge'
import { KanbanColumn } from './KanbanColumn'

export function KanbanBoard({ jobs }: { jobs: Job[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map((status) => (
        <KanbanColumn key={status} status={status} jobs={jobs.filter((j) => j.status === status)} />
      ))}
    </div>
  )
}
