import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { useSoundtrackPlayer } from '../hooks/useSoundtrackPlayer'

const EQ_BARS = [0, 0.25, 0.5, 0.15]

export function SoundtrackPill() {
  const { current, status, toggle } = useSoundtrackPlayer()
  const playing = status === 'playing'

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key="soundtrack-pill"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-60 flex justify-center px-4"
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause soundtrack' : 'Play soundtrack'}
            className="glass-panel pointer-events-auto flex h-10 cursor-pointer items-center gap-3 rounded-full pl-4 pr-5 text-text-primary transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            {playing ? (
              <Pause size={14} strokeWidth={2} fill="currentColor" />
            ) : (
              <Play size={14} strokeWidth={2} fill="currentColor" />
            )}

            <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
              {EQ_BARS.map((delay, i) => (
                <span
                  key={i}
                  className={playing ? 'eq-bar' : 'eq-bar eq-bar-idle'}
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </span>

            <span className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-text-muted">
              {playing ? 'Now playing' : 'Tap to play'}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
