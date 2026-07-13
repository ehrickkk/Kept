import { createContext } from 'react'
import type { Soundtrack } from '../types'

export type SoundtrackStatus = 'playing' | 'paused'

export interface SoundtrackPlayerContextValue {
  /** Track currently loaded into the player (view is open), even if paused */
  current: Soundtrack | null
  status: SoundtrackStatus
  muted: boolean
  play: (track: Soundtrack) => void
  toggle: () => void
  /** Stops playback only if the given track is the one currently loaded */
  stopTrack: (track: Soundtrack) => void
  stopAll: () => void
  setMuted: (muted: boolean) => void
}

export const SoundtrackPlayerContext = createContext<
  SoundtrackPlayerContextValue | undefined
>(undefined)
