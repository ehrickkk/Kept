import { useCallback, useEffect, useMemo, useState } from 'react'
import { AddPhotoButton } from '../components/AddPhotoButton'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MonthSection } from '../components/MonthSection'
import { MonthStackSection } from '../components/MonthStackSection'
import { UploadModal } from '../components/UploadModal'
import { ViewModeToggle, type ViewMode } from '../components/ViewModeToggle'
import { YearOverviewSection } from '../components/YearOverviewSection'
import { useAuth } from '../hooks/useAuth'
import { deletePhoto, fetchPhotos } from '../lib/photos'
import { groupPhotosByMonth, groupPhotosByYear } from '../lib/utils'
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
  const [scrollToMonthKey, setScrollToMonthKey] = useState<string | null>(null)

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

  const yearSummaries = useMemo(() => groupPhotosByYear(photos), [photos])

  useEffect(() => {
    if (viewMode !== 'month' || !scrollToMonthKey) return

    const targetId = `month-${scrollToMonthKey}`
    const frame = window.requestAnimationFrame(() => {
      const el = document.getElementById(targetId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setScrollToMonthKey(null)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [viewMode, scrollToMonthKey, monthGroups])

  const handleUploadSuccess = (uploaded: PhotoEntry[]) => {
    setPhotos((prev) => [...uploaded, ...prev])
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

  const openMonthViewAt = (monthKey: string) => {
    setScrollToMonthKey(monthKey)
    setViewMode('month')
  }

  const handleSelectYear = (year: string) => {
    const firstMonth = monthGroups.find(([key]) => key.startsWith(`${year}-`))
    if (firstMonth) openMonthViewAt(firstMonth[0])
    else setViewMode('month')
  }

  const handleSelectMonth = (monthKey: string) => {
    openMonthViewAt(monthKey)
  }

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

        {!loading && !error && photos.length > 0 && viewMode === 'year' && (
          <YearOverviewSection
            years={yearSummaries}
            onSelectYear={handleSelectYear}
            onSelectMonth={handleSelectMonth}
          />
        )}

        {!loading && !error && monthGroups.length > 0 && viewMode === 'moment' && (
          <div>
            {monthGroups.map(([monthKey, monthPhotos]) => (
              <MonthSection
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

        {!loading && !error && monthGroups.length > 0 && viewMode === 'month' && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {monthGroups.map(([monthKey, monthPhotos]) => (
              <MonthStackSection
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
