import { useCallback, useEffect, useMemo, useState } from 'react'
import { AddPhotoButton } from '../components/AddPhotoButton'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MonthSection } from '../components/MonthSection'
import { MonthStackSection } from '../components/MonthStackSection'
import { UploadModal } from '../components/UploadModal'
import { ViewModeToggle, type ViewMode } from '../components/ViewModeToggle'
import { useAuth } from '../hooks/useAuth'
import { deletePhoto, fetchPhotos } from '../lib/photos'
import { groupPhotosByMonth } from '../lib/utils'
import type { PhotoEntry } from '../types'

export function ScrapbookPage() {
  const { session } = useAuth()
  const isAdmin = !!session

  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('moment')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPhotos()
      setPhotos(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load photos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

  const monthGroups = useMemo(() => {
    const grouped = groupPhotosByMonth(photos)
    return [...grouped.entries()].sort(([a], [b]) => b.localeCompare(a))
  }, [photos])

  const handleUploadSuccess = (photo: PhotoEntry) => {
    setPhotos((prev) => [photo, ...prev])
  }

  const handleDelete = async (photo: PhotoEntry) => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return

    setDeletingId(photo.id)
    try {
      await deletePhoto(photo)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      window.alert(message)
    } finally {
      setDeletingId(null)
    }
  }

  const SectionComponent = viewMode === 'moment' ? MonthSection : MonthStackSection

  return (
    <div className="min-h-screen bg-background">
      <header className="relative px-4 pb-15 pt-20 text-center sm:pt-24 md:pt-28">
        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          kept
        </h1>
        <p className="mt-2 font-mono-label text-xs uppercase tracking-widest text-text-muted">
          Archive of Moments
        </p>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-24">
        {loading && <LoadingSpinner message="Loading frames..." />}

        {error && (
          <div className="py-8">
            <ErrorMessage message={error} onRetry={loadPhotos} />
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <p className="py-16 text-center text-sm text-text-muted">
            No photos yet.
          </p>
        )}

        {!loading && !error && monthGroups.length > 0 && (
          <div
            className={
              viewMode === 'moment'
                ? undefined
                : 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
            }
          >
            {monthGroups.map(([monthKey, monthPhotos]) => (
              <SectionComponent
                key={monthKey}
                monthKey={monthKey}
                photos={monthPhotos}
                isAdmin={isAdmin}
                onDelete={isAdmin ? handleDelete : undefined}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </main>

      {isAdmin && (
        <>
          <AddPhotoButton onClick={() => setUploadOpen(true)} />
          <UploadModal
            open={uploadOpen}
            onClose={() => setUploadOpen(false)}
            onSuccess={handleUploadSuccess}
          />
        </>
      )}
    </div>
  )
}
