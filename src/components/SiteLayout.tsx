import { Outlet } from 'react-router-dom'
import { PillNavBar } from './PillNavBar'

export function SiteLayout() {
  return (
    <>
      <PillNavBar />
      <Outlet />
    </>
  )
}
