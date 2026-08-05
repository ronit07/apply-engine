import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { StatusBadge } from '../components/common/StatusBadge'
import { TailoringProgress } from '../components/review/TailoringProgress'
import { ResumeEditor } from '../components/review/ResumeEditor'
import { CoverLetterEditor } from '../components/review/CoverLetterEditor'
import { PdfPreview } from '../components/review/PdfPreview'
import { useJob, useSetJobStatus } from '../hooks/useJobs'
import {
  useTailoringStatus,
  useTriggerTailoring,
  useUpdateCoverLetter,
  useUpdateResume,
} from '../hooks/useTailoring'
import { tailoringApi } from '../api/tailoring'
import { useQueryClient } from '@tanstack/react-query'
import type { TailoredResumeContent } from '../types'

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const id = Number(jobId)
  const queryClient = useQueryClient()

  const { data: job, isLoading } = useJob(id)
  const isRunning = job?.status === 'TAILORING'
  // Fetch status whenever a job exists, not just while status === TAILORING —
  // otherwise a failed run that already reverted the job to SOURCED becomes
  // invisible on reload (silent failure instead of a surfaced error).
  const { data: tailoringStatus } = useTailoringStatus(id, Boolean(job))
  const triggerTailoring = useTriggerTailoring(id)
  const setStatus = useSetJobStatus(id)
  const updateResume = useUpdateResume(id)
  const updateCoverLetter = useUpdateCoverLetter(id)

  const [resumeDraft, setResumeDraft] = useState<TailoredResumeContent | null>(null)
  const [coverDraft, setCoverDraft] = useState('')
  const [resumeVersion, setResumeVersion] = useState(0)
  const [coverVersion, setCoverVersion] = useState(0)

  useEffect(() => {
    if (job?.tailored_resume) setResumeDraft(job.tailored_resume.resume)
    if (job?.cover_letter) setCoverDraft(job.cover_letter.body_text)
  }, [job?.tailored_resume, job?.cover_letter])

  useEffect(() => {
    if (tailoringStatus?.overall_status === 'succeeded' || tailoringStatus?.overall_status === 'failed') {
      queryClient.invalidateQueries({ queryKey: ['job', id] })
    }
  }, [tailoringStatus?.overall_status, id, queryClient])

  if (isLoading || !job) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Loading…" />
      </div>
    )
  }

  const warnings = job.tailored_resume?.warnings ?? []

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <TopBar
        title={`${job.role_title} at ${job.company}`}
        subtitle={undefined}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            {job.status === 'READY_FOR_REVIEW' && (
              <button
                onClick={() => setStatus.mutate('APPROVED')}
                disabled={setStatus.isPending}
                className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Approve
              </button>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        <details className="rounded-lg border border-neutral-200 dark:border-neutral-800" open={!job.tailored_resume}>
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Job description
          </summary>
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            {job.jd_text}
          </div>
        </details>

        {!job.tailored_resume && !isRunning && (
          <button
            onClick={() => triggerTailoring.mutate()}
            disabled={triggerTailoring.isPending}
            className="flex w-fit items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            <Sparkles size={15} />
            {triggerTailoring.isPending ? 'Starting…' : 'Generate tailored materials'}
          </button>
        )}
        {triggerTailoring.isError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {(triggerTailoring.error as Error).message}
          </p>
        )}

        {tailoringStatus &&
          (tailoringStatus.overall_status === 'running' ||
            tailoringStatus.overall_status === 'failed') && (
            <TailoringProgress status={tailoringStatus} />
          )}

        {warnings.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={16} />
              Double-check before approving
            </div>
            <ul className="ml-6 list-disc space-y-0.5 text-xs">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {resumeDraft && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Resume</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ResumeEditor resume={resumeDraft} onChange={setResumeDraft} />
              <div className="flex flex-col gap-2">
                <PdfPreview
                  url={`${tailoringApi.resumePdfUrl(id)}?v=${resumeVersion}`}
                  refreshKey={resumeVersion}
                  label="Resume preview"
                />
              </div>
            </div>
            <button
              onClick={() =>
                updateResume.mutate(resumeDraft, {
                  onSuccess: () => setResumeVersion((v) => v + 1),
                })
              }
              disabled={updateResume.isPending}
              className="w-fit rounded-md border border-neutral-300 px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {updateResume.isPending ? 'Saving…' : 'Save resume'}
            </button>
          </section>
        )}

        {job.cover_letter && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Cover letter
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CoverLetterEditor bodyText={coverDraft} onChange={setCoverDraft} />
              <PdfPreview
                url={`${tailoringApi.coverLetterPdfUrl(id)}?v=${coverVersion}`}
                refreshKey={coverVersion}
                label="Cover letter preview"
              />
            </div>
            <button
              onClick={() =>
                updateCoverLetter.mutate(coverDraft, {
                  onSuccess: () => setCoverVersion((v) => v + 1),
                })
              }
              disabled={updateCoverLetter.isPending}
              className="w-fit rounded-md border border-neutral-300 px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {updateCoverLetter.isPending ? 'Saving…' : 'Save cover letter'}
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
