import { Home, Info, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { NavBarProps } from './PillNavBar'

function TabContent({
  icon,
  label,
  active,
}: {
  icon: ReactNode
  label: string
  active: boolean
}) {
  return (
    <span
      className={`flex flex-col items-center gap-0.5 transition-colors duration-300 ease-out ${
        active ? 'text-accent' : 'text-text-muted'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium leading-tight">{label}</span>
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full transition-opacity duration-300 ${
          active ? 'bg-accent opacity-100' : 'opacity-0'
        }`}
      />
    </span>
  )
}

function TabLink({
  to,
  end,
  label,
  icon,
}: {
  to: string
  end?: boolean
  label: string
  icon: ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className="flex min-h-11 min-w-11 flex-1 items-center justify-center py-1.5"
    >
      {({ isActive }) => (
        <TabContent icon={icon} label={label} active={isActive} />
      )}
    </NavLink>
  )
}

/** Fixed bottom navigation, tablet and mobile (below lg) only. */
export function BottomNavBar({
  onAccountClick,
  accountActive,
  hasSession,
}: NavBarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="glass-panel fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-stretch">
        <TabLink
          to="/"
          end
          label="Kept"
          icon={
            <span
              aria-hidden="true"
              className="h-5 w-5 bg-current transition-colors duration-300 ease-out"
              style={{
                maskImage: 'url(/kept-icon.png)',
                WebkitMaskImage: 'url(/kept-icon.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            />
          }
        />
        <TabLink
          to="/home"
          end
          label="Home"
          icon={<Home size={20} strokeWidth={1.75} />}
        />
        <TabLink
          to="/about"
          label="About"
          icon={<Info size={20} strokeWidth={1.75} />}
        />
        <button
          type="button"
          onClick={onAccountClick}
          aria-label="Account"
          aria-haspopup={hasSession ? 'dialog' : undefined}
          className="flex min-h-11 min-w-11 flex-1 items-center justify-center py-1.5"
        >
          <TabContent
            icon={<User size={20} strokeWidth={1.75} />}
            label="Account"
            active={accountActive}
          />
        </button>
      </div>
    </nav>
  )
}
