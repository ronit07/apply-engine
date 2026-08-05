import { CheckCircle2, Clock, FolderKanban, Sparkles } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { StatCard } from '../components/dashboard/StatCard'
import { KanbanBoard } from '../components/dashboard/KanbanBoard'
import { useJobs } from '../hooks/useJobs'

export function DashboardPage() {
  const { data: jobs, isLoading, isError } = useJobs()

  const total = jobs?.length ?? 0
  const inReview = jobs?.filter((j) => j.status === 'READY_FOR_REVIEW').length ?? 0
  const approved = jobs?.filter((j) => j.status === 'APPROVED').length ?? 0
  const tailoring = jobs?.filter((j) => j.status === 'TAILORING').length ?? 0

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <TopBar title="Dashboard" subtitle="Every job you're tracking, at a glance." />

      <div className="flex flex-col gap-6 p-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total jobs" value={total} icon={FolderKanban} />
          <StatCard label="Tailoring" value={tailoring} icon={Sparkles} />
          <StatCard label="In review" value={inReview} icon={Clock} />
          <StatCard label="Approved" value={approved} icon={CheckCircle2} />
        </div>

        {isLoading && <p className="text-sm text-neutral-500">Loading jobs…</p>}
        {isError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Couldn't load jobs. Is the API server running?
          </p>
        )}
        {jobs && jobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No jobs yet. Add your first one to get started.
            </p>
          </div>
        )}
        {jobs && jobs.length > 0 && <KanbanBoard jobs={jobs} />}
      </div>
    </div>
  )
}
