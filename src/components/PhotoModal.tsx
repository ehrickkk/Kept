import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { formatFrameDate } from '../lib/utils'
import type { PhotoEntry } from '../types'

interface PhotoModalProps {
  photo: PhotoEntry | null
  photos: PhotoEntry[]
  onClose: () => void
  onNavigate: (photo: PhotoEntry) => void
}

export function PhotoModal({ photo, photos, onClose, onNavigate }: PhotoModalProps) {
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(photos[currentIndex - 1])
  }, [hasPrev, photos, currentIndex, onNavigate])

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(photos[currentIndex + 1])
  }, [hasNext, photos, currentIndex, onNavigate])

  useEffect(() => {
    if (!photo) return

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
  }, [photo, onClose, goPrev, goNext])

  return (
    <AnimatePresence>
      {photo && (
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
            aria-label="Close modal"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={photo.caption || 'Photo detail'}
            className="relative z-10 flex w-full max-w-lg flex-col"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex max-h-[85dvh] flex-col overflow-hidden rounded border border-border bg-surface">
              <button
                type="button"
                onClick={onClose}
                className="tap-target absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-text-muted transition hover:text-text-primary"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="overflow-y-auto p-3 pb-4">
                <div className="flex items-center justify-center overflow-hidden bg-background p-1">
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Photo'}
                    className="max-h-[60dvh] max-w-full object-contain"
                  />
                </div>

                <div className="mt-3 shrink-0 border-t border-border pt-3">
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
            </div>

            {photos.length > 1 && (
              <div className="mt-3 flex shrink-0 items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!hasPrev}
                  className="flex min-h-10 items-center rounded border border-border bg-surface px-3 py-1.5 text-xs text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="font-mono-label text-xs text-text-muted">
                  {currentIndex + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!hasNext}
                  className="flex min-h-10 items-center rounded border border-border bg-surface px-3 py-1.5 text-xs text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
