import { useRef } from 'react'
import { FileText, Upload } from 'lucide-react'
import type { Profile } from '../../types'

interface ResumeUploadProps {
  profile?: Profile
  onUpload: (file: File) => void
  uploading: boolean
}

export function ResumeUpload({ profile, onUpload, uploading }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Source resume
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            .pdf, .docx, .txt, or .md — this is what every tailored resume is built from.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Upload size={14} />
          {uploading ? 'Uploading…' : profile?.resume_original_filename ? 'Replace' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ''
          }}
        />
      </div>

      {profile?.resume_original_filename ? (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
          <FileText size={14} />
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {profile.resume_original_filename}
          </span>
        </div>
      ) : (
        <p className="text-xs text-neutral-400 dark:text-neutral-600">No resume uploaded yet.</p>
      )}

      {profile?.resume_raw_text && (
        <details className="text-xs text-neutral-500 dark:text-neutral-400">
          <summary className="cursor-pointer select-none font-medium text-neutral-700 dark:text-neutral-300">
            Preview extracted text
          </summary>
          <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-neutral-50 p-3 font-mono text-[11px] leading-relaxed dark:bg-neutral-900">
            {profile.resume_raw_text}
          </pre>
        </details>
      )}
    </div>
  )
}
