import { Outlet } from 'react-router-dom'
import { PillNavBar } from './PillNavBar'
import { SoundtrackPill } from './SoundtrackPill'

export function SiteLayout() {
  return (
    <>
      <PillNavBar />
      <Outlet />
      <SoundtrackPill />
    </>
  )
}
