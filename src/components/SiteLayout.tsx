import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AccountModal } from './AccountModal'
import { BottomNavBar } from './BottomNavBar'
import { FloatingMuteButton } from './FloatingMuteButton'
import { PillNavBar } from './PillNavBar'
import { SoundtrackPill } from './SoundtrackPill'

export function SiteLayout() {
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

  const accountActive =
    accountOpen || (!session && location.pathname === '/login')

  return (
    <>
      <PillNavBar
        onAccountClick={handleAccountClick}
        accountActive={accountActive}
        hasSession={!!session}
      />
      <Outlet />
      <SoundtrackPill />
      <FloatingMuteButton />
      <BottomNavBar
        onAccountClick={handleAccountClick}
        accountActive={accountActive}
        hasSession={!!session}
      />

      <AccountModal
        open={accountOpen && !!session}
        email={session?.user.email ?? ''}
        onClose={() => setAccountOpen(false)}
        onLogout={signOut}
      />
    </>
  )
}
