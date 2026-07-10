import type { PhotoEntry } from '../types'
import { PhotoMasonryGrid } from './PhotoMasonryGrid'

interface YearFeedSectionProps {
  year: string
  photos: PhotoEntry[]
  isAdmin?: boolean
  onDelete?: (photo: PhotoEntry) => void
  deletingId?: string | null
}

export function YearFeedSection({
  year,
  photos,
  isAdmin = false,
  onDelete,
  deletingId = null,
}: YearFeedSectionProps) {
  return (
    <div>
      <div className="sticky top-16 z-20 mb-6 flex justify-center sm:top-20">
        <span className="rounded-full border border-border bg-surface/95 px-4 py-1.5 font-mono-label text-[11px] tracking-[0.14em] text-text-muted backdrop-blur-sm">
          {year}
        </span>
      </div>

      <PhotoMasonryGrid
        photos={photos}
        isAdmin={isAdmin}
        onDelete={onDelete}
        deletingId={deletingId}
        heroFirst
      />
    </div>
  )
}
