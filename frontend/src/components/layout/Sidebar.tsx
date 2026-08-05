import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Plus, UserRound, Zap } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/jobs/new', label: 'Add job', icon: Plus, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <Zap size={16} strokeWidth={2.5} />
        </span>
        <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Apply Engine
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-5 py-4 text-xs text-neutral-400 dark:text-neutral-600">
        Phase 1 · local &amp; single-user
      </div>
    </aside>
  )
}
