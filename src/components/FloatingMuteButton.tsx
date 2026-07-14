import { Volume2, VolumeX } from 'lucide-react'
import { useSoundtrackPlayer } from '../hooks/useSoundtrackPlayer'

/**
 * Global mute toggle for tablet/mobile (below lg), where the pill navbar and
 * its integrated mute button are hidden. Sits above the bottom nav bar.
 */
export function FloatingMuteButton() {
  const { muted, setMuted } = useSoundtrackPlayer()

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'Unmute soundtracks' : 'Mute soundtracks'}
      aria-pressed={muted}
      className={`glass-panel fixed z-40 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 ease-out lg:hidden bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] ${
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
  )
}
