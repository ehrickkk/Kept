import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { formatFrameDate, formatMonthHeader, sortByCreatedAtDesc } from '../lib/utils'
import type { PhotoEntry } from '../types'
import { MonthCarouselModal } from './MonthCarouselModal'

interface MonthStackSectionProps {
  monthKey: string
  photos: PhotoEntry[]
  isAdmin?: boolean
  onDelete?: (photo: PhotoEntry) => void
  deletingId?: string | null
}

const PEEK_LAYERS = [
  { x: 8, y: 5 },
  { x: 14, y: 12 },
  { x: 20, y: 19 },
]

export function MonthStackSection({
  monthKey,
  photos,
  isAdmin = false,
  onDelete,
  deletingId = null,
}: MonthStackSectionProps) {
  const [carouselOpen, setCarouselOpen] = useState(false)

  const sortedPhotos = useMemo(() => sortByCreatedAtDesc(photos), [photos])
  const coverPhoto = sortedPhotos[0]
  const showStack = photos.length > 1
  const peekCount = Math.min(photos.length - 1, 3)

  return (
    <section className="mb-16">
      <h2 className="font-display mb-8 text-center text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
        {formatMonthHeader(monthKey)}
      </h2>

      <div className="flex justify-center">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={() => setCarouselOpen(true)}
          className="group relative w-full max-w-[280px] cursor-pointer bg-transparent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-label={`View ${photos.length} photos from ${formatMonthHeader(monthKey)}`}
        >
          <div className="relative">
            {showStack &&
              PEEK_LAYERS.slice(0, peekCount).map((layer, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-xl border border-border bg-surface"
                  style={{
                    transform: `translate(${layer.x}px, ${layer.y}px)`,
                    zIndex: i + 1,
                  }}
                  aria-hidden="true"
                />
              ))}

            <div
              className="relative rounded-xl border border-border bg-surface p-4 transition-colors group-hover:border-accent/60"
              style={{ zIndex: 10 }}
            >
              <div className="relative aspect-4/5 overflow-hidden bg-background">
                <img
                  src={coverPhoto.image_url}
                  alt={coverPhoto.caption || 'Photo'}
                  loading="lazy"
                  className="h-full w-full object-cover rounded-md"
                  />
                {showStack && (
                  <span className="absolute bottom-2 right-2 rounded border border-border bg-surface/90 px-2 py-0.5 font-mono-label text-[10px] tracking-wide text-text-muted">
                    {photos.length} photos
                  </span>
                )}
              </div>

              <div className="mt-2 border-t border-border pt-2">
                {coverPhoto.caption && (
                  <p className="line-clamp-2 text-[14px] text-left leading-snug text-text-primary">
                    {coverPhoto.caption}
                  </p>
                )}
                <p className="mt-1 font-mono-label text-[10px] text-left tracking-wide text-text-muted">
                  {formatFrameDate(coverPhoto.date)}
                </p>
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      <MonthCarouselModal
        open={carouselOpen}
        photos={sortedPhotos}
        onClose={() => setCarouselOpen(false)}
        isAdmin={isAdmin}
        onDelete={onDelete}
        deletingId={deletingId}
      />
    </section>
  )
}
