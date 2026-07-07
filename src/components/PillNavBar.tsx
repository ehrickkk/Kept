import { Home, Info, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
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
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `rounded-full p-2 transition-colors ${
          isActive
            ? 'text-accent'
            : 'text-text-muted hover:text-text-primary'
        }`
      }
    >
      {icon}
    </NavLink>
  )
}

export function PillNavBar() {
  const { session, signOut } = useAuth()
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

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed left-1/2 top-3 z-40 -translate-x-1/2 sm:top-4"
      >
        <div className="glass-panel flex items-center gap-0.5 rounded-full px-1.5 py-1 sm:gap-1 sm:px-2">
          <Link
            to="/"
            className="font-display shrink-0 px-2 py-1 text-xs font-semibold tracking-widest text-text-primary transition-colors hover:text-accent sm:px-3 sm:text-sm"
            aria-label="Kept home"
          >
            KPT
          </Link>

          <NavIconLink to="/" end label="Home" icon={<Home size={18} strokeWidth={1.75} />} />
          <NavIconLink to="/about" label="About" icon={<Info size={18} strokeWidth={1.75} />} />

          <button
            type="button"
            onClick={handleAccountClick}
            title="Account"
            aria-label="Account"
            aria-haspopup={session ? 'dialog' : undefined}
            className={`rounded-full p-2 transition-colors ${
              accountOpen || (!session && location.pathname === '/login')
                ? 'text-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <User size={18} strokeWidth={1.75} />
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
