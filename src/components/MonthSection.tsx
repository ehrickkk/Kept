import { useState } from 'react'
import { formatMonthHeader } from '../lib/utils'
import type { PhotoEntry } from '../types'
import { PhotoCard } from './PhotoCard'
import { PhotoModal } from './PhotoModal'

interface MonthSectionProps {
  monthKey: string
  photos: PhotoEntry[]
  isAdmin?: boolean
  onDelete?: (photo: PhotoEntry) => void
  deletingId?: string | null
}

export function MonthSection({
  monthKey,
  photos,
  isAdmin = false,
  onDelete,
  deletingId = null,
}: MonthSectionProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null)

  return (
    <section className="mb-16">
      <h2 className="font-display mb-8 text-center text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
        {formatMonthHeader(monthKey)}
      </h2>

      <div className="columns-1 gap-x-2 sm:columns-2 lg:columns-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            isHero={index === 0}
            onClick={() => setSelectedPhoto(photo)}
            isAdmin={isAdmin}
            onDelete={onDelete}
            deleting={deletingId === photo.id}
          />
        ))}
      </div>

      <PhotoModal
        photo={selectedPhoto}
        photos={photos}
        onClose={() => setSelectedPhoto(null)}
        onNavigate={setSelectedPhoto}
      />
    </section>
  )
}
