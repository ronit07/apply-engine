interface PdfPreviewProps {
  url: string
  refreshKey: number | string
  label: string
}

export function PdfPreview({ url, refreshKey, label }: PdfPreviewProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        {label}
      </div>
      <iframe
        key={refreshKey}
        src={`${url}#toolbar=0`}
        title={label}
        className="min-h-[500px] flex-1 bg-white"
      />
    </div>
  )
}
