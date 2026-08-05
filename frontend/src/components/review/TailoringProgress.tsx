import { AlertTriangle, Loader2 } from 'lucide-react'
import type { TailoringStatus } from '../../types'

const STEP_LABELS: Record<string, string> = {
  keywords: 'Extracting keywords…',
  resume: 'Tailoring resume…',
  cover_letter: 'Drafting cover letter…',
  full: 'Tailoring resume and drafting cover letter…',
}

export function TailoringProgress({ status }: { status: TailoringStatus }) {
  const latestRun = status.runs[0]

  if (status.overall_status === 'failed') {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Tailoring failed.</p>
          {latestRun?.error_message && (
            <p className="mt-1 text-xs opacity-80">{latestRun.error_message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
      <Loader2 size={18} className="shrink-0 animate-spin" />
      <span>{STEP_LABELS[latestRun?.run_type ?? 'full']}</span>
    </div>
  )
}
