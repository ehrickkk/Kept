import { Home, Info, User, Volume2, VolumeX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSoundtrackPlayer } from '../hooks/useSoundtrackPlayer'

function NavIconLink({
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
      className={({ isActive }) =>
        `group relative flex h-10 items-center justify-center gap-2 rounded-full px-3 transition-colors duration-300 ease-out ${
          isActive
            ? 'text-accent'
            : 'text-text-muted hover:text-text-primary'
        }`
      }
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  )
}

export interface NavBarProps {
  onAccountClick: () => void
  accountActive: boolean
  hasSession: boolean
}

/** Top floating pill navigation, desktop (lg and up) only. */
export function PillNavBar({
  onAccountClick,
  accountActive,
  hasSession,
}: NavBarProps) {
  const { muted, setMuted } = useSoundtrackPlayer()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed left-1/2 z-40 hidden w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 top-[max(1rem,env(safe-area-inset-top))] lg:block"
    >
      <div className="glass-panel grid grid-cols-[1fr_auto_1fr] items-center rounded-full px-5 py-1">
        {/* Logo section */}
        <Link
          to="/"
          className="flex items-center justify-self-start gap-2 font-display px-1 py-1 text-[18px] font-semibold tracking-widest text-text-primary transition-colors duration-300 ease-out hover:text-accent"
          aria-label="Kept landing page"
        >
          <span
            aria-hidden="true"
            className="h-6 w-6 bg-current transition-colors duration-300 ease-out"
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
          kept
        </Link>

        {/* Icons section */}
        <div className="flex items-center justify-self-center gap-3">
          <NavIconLink
            to="/home"
            end
            label="Home"
            icon={<Home size={18} strokeWidth={1.75} />}
          />
          <NavIconLink
            to="/about"
            label="About"
            icon={<Info size={18} strokeWidth={1.75} />}
          />

          <button
            type="button"
            onClick={onAccountClick}
            aria-label="Account"
            aria-haspopup={hasSession ? 'dialog' : undefined}
            className={`group relative flex h-10 items-center justify-center gap-2 rounded-full px-3 transition-colors duration-300 ease-out ${
              accountActive
                ? 'text-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <User size={18} strokeWidth={1.75} />
            <span className="text-sm font-medium">Account</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Unmute soundtracks' : 'Mute soundtracks'}
          aria-pressed={muted}
          title={muted ? 'Unmute soundtracks' : 'Mute soundtracks'}
          className={`flex h-10 w-10 items-center justify-center justify-self-end rounded-full transition-colors duration-300 ease-out ${
            muted
              ? 'text-text-muted hover:text-text-primary'
              : 'text-accent hover:text-accent/80'
          }`}
        >
          {muted ? (
            <VolumeX size={18} strokeWidth={1.75} />
          ) : (
            <Volume2 size={18} strokeWidth={1.75} />
          )}
        </button>
      </div>
    </nav>
  )
}
