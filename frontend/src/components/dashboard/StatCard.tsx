import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        <Icon size={18} strokeWidth={2} />
      </span>
      <div>
        <div className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
          {value}
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
      </div>
    </div>
  )
}
