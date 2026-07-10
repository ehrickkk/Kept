import { useCallback, useEffect, useMemo, useState } from 'react'
import { AddPhotoButton } from '../components/AddPhotoButton'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MonthSection } from '../components/MonthSection'
import { MonthStackSection } from '../components/MonthStackSection'
import { UploadModal } from '../components/UploadModal'
import { ViewModeToggle, type ViewMode } from '../components/ViewModeToggle'
import { YearCoverModal } from '../components/YearCoverModal'
import { YearFeedSection } from '../components/YearFeedSection'
import { YearOverviewSection } from '../components/YearOverviewSection'
import { useAuth } from '../hooks/useAuth'
import { deletePhoto, fetchPhotos } from '../lib/photos'
import {
  groupPhotosByMonth,
  groupPhotosByYear,
  photosForYear,
} from '../lib/utils'
import { fetchYearCovers } from '../lib/yearCovers'
import type { PhotoEntry, YearCover } from '../types'

export function ScrapbookPage() {
  const { session } = useAuth()
  const isAdmin = !!session

  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [yearCovers, setYearCovers] = useState<YearCover[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('moment')
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [scrollToMonthKey, setScrollToMonthKey] = useState<string | null>(null)
  const [coverEditYear, setCoverEditYear] = useState<string | null>(null)

  const loadPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [photoData, coverData] = await Promise.all([
        fetchPhotos(),
        fetchYearCovers().catch(() => [] as YearCover[]),
      ])
      setPhotos(photoData)
      setYearCovers(coverData)
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

  const coverByYear = useMemo(() => {
    const map = new Map<number, string>()
    for (const cover of yearCovers) {
      map.set(cover.year, cover.image_url)
    }
    return map
  }, [yearCovers])

  const selectedYearPhotos = useMemo(
    () => (selectedYear ? photosForYear(photos, selectedYear) : []),
    [photos, selectedYear],
  )

  const editingCover = useMemo(() => {
    if (!coverEditYear) return null
    const yearNum = Number(coverEditYear)
    const custom = yearCovers.find((cover) => cover.year === yearNum) ?? null
    return {
      year: coverEditYear,
      customUrl: custom?.image_url ?? null,
      hasCustomCover: !!custom,
    }
  }, [coverEditYear, yearCovers])

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

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'year' && selectedYear !== null) {
      setSelectedYear(null)
      setViewMode('year')
      return
    }
    setSelectedYear(null)
    setViewMode(mode)
  }

  const handleSelectYear = (year: string) => {
    setSelectedYear(year)
    setViewMode('year')
  }

  const handleCoverSaved = (cover: YearCover | null) => {
    if (!coverEditYear) return
    const yearNum = Number(coverEditYear)

    setYearCovers((prev) => {
      const without = prev.filter((entry) => entry.year !== yearNum)
      return cover ? [...without, cover].sort((a, b) => b.year - a.year) : without
    })
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
        <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-24">
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
          selectedYear ? (
            <YearFeedSection
              year={selectedYear}
              photos={selectedYearPhotos}
              isAdmin={isAdmin}
              onDelete={isAdmin ? handleDelete : undefined}
              deletingId={deletingId}
            />
          ) : (
            <YearOverviewSection
              years={yearSummaries}
              coverByYear={coverByYear}
              isAdmin={isAdmin}
              onSelectYear={handleSelectYear}
              onEditCover={isAdmin ? setCoverEditYear : undefined}
            />
          )
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
          {editingCover && (
            <YearCoverModal
              open={!!coverEditYear}
              year={editingCover.year}
              currentCoverUrl={editingCover.customUrl}
              hasCustomCover={editingCover.hasCustomCover}
              onClose={() => setCoverEditYear(null)}
              onSaved={handleCoverSaved}
            />
          )}
        </>
      )}
    </div>
  )
}
