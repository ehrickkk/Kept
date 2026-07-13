import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useScopedSoundtrack } from '../hooks/useSoundtrackPlayer'
import { formatFrameDate } from '../lib/utils'
import type { PhotoEntry, Soundtrack } from '../types'

interface MonthCarouselModalProps {
  open: boolean
  photos: PhotoEntry[]
  initialIndex?: number
  onClose: () => void
  isAdmin?: boolean
  onDelete?: (photo: PhotoEntry) => void
  deletingId?: string | null
  soundtrack?: Soundtrack | null
}

const SWIPE_THRESHOLD = 50

export function MonthCarouselModal({
  open,
  photos,
  initialIndex = 0,
  onClose,
  isAdmin = false,
  onDelete,
  deletingId = null,
  soundtrack = null,
}: MonthCarouselModalProps) {
  const [index, setIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  useScopedSoundtrack(soundtrack, open)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  useEffect(() => {
    if (!open) return
    if (photos.length === 0) {
      onClose()
      return
    }
    if (index >= photos.length) {
      setIndex(Math.max(0, photos.length - 1))
    }
  }, [open, photos.length, index, onClose])

  const goPrev = useCallback(() => {
    if (photos.length === 0) return
    setDirection(-1)
    setIndex((i) => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  const goNext = useCallback(() => {
    if (photos.length === 0) return
    setDirection(1)
    setIndex((i) => (i + 1) % photos.length)
  }, [photos.length])

  const handleDragEnd = (_event: PointerEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) goNext()
    else if (info.offset.x > SWIPE_THRESHOLD) goPrev()
  }

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, goPrev, goNext])

  const handleDelete = (e: MouseEvent, target: PhotoEntry) => {
    e.stopPropagation()
    onDelete?.(target)
  }

  const photo = photos[index]

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close carousel"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Month photos"
            className="relative z-10 flex w-full max-w-lg flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -right-1 -top-1 z-20 flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-text-muted transition hover:text-text-primary md:-right-2 md:-top-2"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex w-full max-h-[90vh] items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-surface text-text-muted transition hover:border-accent hover:text-accent"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="min-w-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={photo.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={handleDragEnd}
                    className="mx-auto w-full max-w-[300px] cursor-grab active:cursor-grabbing"
                  >
                    <div className="rounded border border-border bg-surface p-2">
                      <div className="relative flex items-center justify-center overflow-hidden bg-background p-1">
                        <img
                          src={photo.image_url}
                          alt={photo.caption || 'Photo'}
                          className="max-h-[50vh] w-full object-contain sm:max-h-[65vh]"
                          draggable={false}
                        />
                        {isAdmin && onDelete && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, photo)}
                            disabled={deletingId === photo.id}
                            aria-label="Delete photo"
                            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded border border-border bg-surface/90 text-text-muted transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="mt-2 border-t border-border pt-2">
                        {photo.caption && (
                          <p className="text-sm leading-snug text-text-primary">
                            {photo.caption}
                          </p>
                        )}
                        <p className="mt-1 font-mono-label text-[10px] tracking-wide text-text-muted">
                          {formatFrameDate(photo.date)}
                        </p>
                        {photo.tag && (
                          <span className="mt-2 inline-block rounded border border-border px-2 py-0.5 font-mono-label text-[10px] uppercase tracking-wide text-text-muted">
                            {photo.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={goNext}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-surface text-text-muted transition hover:border-accent hover:text-accent"
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <p className="mt-3 font-mono-label text-xs text-text-muted">
              {index + 1} of {photos.length}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
