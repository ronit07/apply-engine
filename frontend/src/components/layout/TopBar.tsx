interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-8 py-5 dark:border-neutral-800">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        )}
      </div>
      {actions}
    </header>
  )
}
