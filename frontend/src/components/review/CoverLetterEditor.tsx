interface CoverLetterEditorProps {
  bodyText: string
  onChange: (text: string) => void
}

export function CoverLetterEditor({ bodyText, onChange }: CoverLetterEditorProps) {
  return (
    <textarea
      value={bodyText}
      onChange={(e) => onChange(e.target.value)}
      rows={16}
      className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    />
  )
}
