import { useContext, useEffect } from 'react'
import type { Soundtrack } from '../types'
import {
  SoundtrackPlayerContext,
  type SoundtrackPlayerContextValue,
} from './soundtrackPlayerContext'

export function useSoundtrackPlayer(): SoundtrackPlayerContextValue {
  const context = useContext(SoundtrackPlayerContext)
  if (!context) {
    throw new Error(
      'useSoundtrackPlayer must be used within a SoundtrackPlayerProvider',
    )
  }
  return context
}

/**
 * Ties a soundtrack to a view's lifecycle: starts playback (from
 * start_seconds, fading in) while `active` is true, and fully stops it when
 * the view closes, unmounts, or the track changes.
 */
export function useScopedSoundtrack(
  track: Soundtrack | null,
  active: boolean,
): void {
  const { play, stopTrack } = useSoundtrackPlayer()

  useEffect(() => {
    if (!active || !track) return
    play(track)
    return () => stopTrack(track)
  }, [active, track, play, stopTrack])
}
