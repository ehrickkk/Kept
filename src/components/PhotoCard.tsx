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
  /** First photo of a month — larger standout tile */
  isHero?: boolean
}

export function PhotoCard({
  photo,
  index,
  onClick,
  isAdmin = false,
  onDelete,
  deleting = false,
  isHero = false,
}: PhotoCardProps) {
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    onDelete?.(photo)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24), ease: 'easeOut' }}
      className={`mb-2 break-inside-avoid ${isHero ? 'column-span-all' : ''}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-surface text-left hover:border-accent/60 hover:scale-98 hover:shadow-2xl transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        aria-label={`View photo: ${photo.caption || 'Untitled'}`}
      >
        <img
          src={photo.image_url}
          alt={photo.caption || 'Photo'}
          loading="lazy"
          className="block h-auto w-full"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/45 to-transparent px-3 pb-3 pt-10">
          {photo.caption && (
            <p className="line-clamp-2 text-sm leading-snug text-text-primary">
              {photo.caption}
            </p>
          )}
          <p
            className={`font-mono-label text-[10px] tracking-wide text-accent ${
              photo.caption ? 'mt-1' : ''
            }`}
          >
            {formatFrameDate(photo.date)}
          </p>
        </div>

        {isAdmin && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete photo"
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded border border-border bg-surface/90 text-text-muted opacity-0 transition hover:border-red-500 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        )}
      </button>
    </motion.div>
  )
}
