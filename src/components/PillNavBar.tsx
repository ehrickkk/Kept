import { Home, Info, User, Volume2, VolumeX } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSoundtrackPlayer } from '../hooks/useSoundtrackPlayer'
import { AccountModal } from './AccountModal'

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

export function PillNavBar() {
  const { session, signOut } = useAuth()
  const { muted, setMuted } = useSoundtrackPlayer()
  const navigate = useNavigate()
  const location = useLocation()
  const [accountOpen, setAccountOpen] = useState(false)

  const handleAccountClick = () => {
    if (!session) {
      navigate('/login')
      return
    }
    setAccountOpen(true)
  }

  const handleLogout = async () => {
    await signOut()
  }

  const userEmail = session?.user.email ?? ''
  const accountActive =
    accountOpen || (!session && location.pathname === '/login')

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed left-1/2 top-3 z-40 w-full max-w-5xl -translate-x-1/2 sm:top-4"
      >
        <div className="glass-panel grid grid-cols-[1fr_auto_1fr] items-center rounded-full px-3 py-1 sm:px-5">
          {/* Logo section */}
          <Link
            to="/"
            className="flex items-center justify-self-start gap-2 font-display px-1 py-1 text-xs font-semibold tracking-widest text-text-primary transition-colors duration-300 ease-out hover:text-accent sm:text-[18px]"
            aria-label="Kept landing page"
          >
            <span
              aria-hidden="true"
              className="h-6 w-6 bg-current transition-colors duration-300 ease-out"
              style={{
                maskImage: 'url(/public/kept-icon.png)',
                WebkitMaskImage: 'url(/public/kept-icon.png)',
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
          <div className="flex items-center justify-self-center gap-1 sm:gap-3">
            {/* <span
              aria-hidden="true"
              className="mx-1 h-5 w-px bg-border sm:mx-2"
            /> */}

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
              onClick={handleAccountClick}
              aria-label="Account"
              aria-haspopup={session ? 'dialog' : undefined}
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

      <AccountModal
        open={accountOpen && !!session}
        email={userEmail}
        onClose={() => setAccountOpen(false)}
        onLogout={handleLogout}
      />
    </>
  )
}
