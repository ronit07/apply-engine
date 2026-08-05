import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { JobForm } from '../components/jobs/JobForm'
import { useCreateJob } from '../hooks/useJobs'
import { ApiError } from '../api/client'

export function AddJobPage() {
  const navigate = useNavigate()
  const createJob = useCreateJob()

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <TopBar title="Add a job" subtitle="Paste a job description or its URL to start tailoring." />
      <div className="max-w-2xl p-8">
        <JobForm
          submitting={createJob.isPending}
          error={createJob.error instanceof ApiError ? createJob.error.message : undefined}
          onSubmit={(payload) =>
            createJob.mutate(payload, {
              onSuccess: (job) => navigate(`/jobs/${job.id}`),
            })
          }
        />
      </div>
    </div>
  )
}
