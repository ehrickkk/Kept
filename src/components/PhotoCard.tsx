import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { MouseEvent } from 'react'
import { formatFrameDate } from '../lib/utils'
import type { PhotoEntry } from '../types'

interface PhotoCardProps {
  photo: PhotoEntry
  index: number
  onClick: () => void
  isAdmin?: boolean
  onDelete?: (photo: PhotoEntry) => void
  deleting?: boolean
}

export function PhotoCard({
  photo,
  index,
  onClick,
  isAdmin = false,
  onDelete,
  deleting = false,
}: PhotoCardProps) {
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    onDelete?.(photo)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="w-full"
    >
      <button
        type="button"
        onClick={onClick}
        className="group w-full cursor-pointer bg-transparent text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        aria-label={`View photo: ${photo.caption || 'Untitled'}`}
      >
        <div className="rounded-xl border border-border bg-surface p-4 transition-colors group-hover:border-accent/60">
          <div className="relative aspect-4/5 overflow-hidden bg-background">
            <img
              src={photo.image_url}
              alt={photo.caption || 'Photo'}
              loading="lazy"
              className="h-full w-full object-cover rounded-md"
            />
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete photo"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded border border-border bg-surface/90 text-text-muted opacity-0 transition hover:border-red-500 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="mt-2 border-t border-border pt-2">
            {photo.caption && (
              <p className="line-clamp-2 text-sm leading-snug text-text-primary">
                {photo.caption}
              </p>
            )}
            <p className="mt-1 font-mono-label text-[10px] tracking-wide text-text-muted">
              {formatFrameDate(photo.date)}
            </p>
          </div>
        </div>
      </button>
    </motion.div>
  )
}
