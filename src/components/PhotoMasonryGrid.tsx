import { useState } from 'react'
import type { PhotoEntry } from '../types'
import { PhotoCard } from './PhotoCard'
import { PhotoModal } from './PhotoModal'

interface PhotoMasonryGridProps {
  photos: PhotoEntry[]
  isAdmin?: boolean
  onDelete?: (photo: PhotoEntry) => void
  deletingId?: string | null
  /** When true, the first photo spans full width as a hero tile */
  heroFirst?: boolean
}

export function PhotoMasonryGrid({
  photos,
  isAdmin = false,
  onDelete,
  deletingId = null,
  heroFirst = true,
}: PhotoMasonryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null)

  if (photos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        No photos in this year.
      </p>
    )
  }

  return (
    <>
      <div className="columns-1 gap-x-2 sm:columns-2 lg:columns-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            isHero={heroFirst && index === 0}
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
    </>
  )
}
