import { useCallback, useEffect, useMemo, useState } from 'react'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { fetchPhotos } from '../lib/photos'
import { getAboutPageStats } from '../lib/utils'
import type { PhotoEntry } from '../types'

const HOW_THIS_WORKS = [
  'No captions written after the fact.',
  'No filters.',
  'Uploaded close to the day it happened.',
  'Nothing curated for anyone else.',
] as const

function MetadataStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span className="text-text-muted">{label}:</span>
      <span className="text-accent">{value}</span>
    </span>
  )
}

function PageDivider() {
  return <hr className="my-10 border-0 border-t border-border sm:my-12" />
}

export function AboutPage() {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const stats = useMemo(() => getAboutPageStats(photos), [photos])

  return (
    <div className="min-h-screen bg-background">
      <main className="relative mx-auto max-w-lg px-6 pb-24 pt-24 sm:pt-28">
        <h1 className="font-display text-3xl text-center font-semibold tracking-tight text-text-primary sm:text-4xl">
          why kept exists?
        </h1>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-text-muted">
          <p>
            This is my running photo diary — a place to drop the little moments
            I don&apos;t want to forget. No filters, no polish, just pictures
            worth keeping.
          </p>
          <p>
            Some months are busy, some are quiet. Either way, I&apos;m glad
            you&apos;re here, flipping through the archive of moments.
          </p>
        </div>

        {loading && <LoadingSpinner message="Loading archive..." />}

        {error && (
          <div className="mt-8">
            <ErrorMessage message={error} onRetry={loadPhotos} />
          </div>
        )}

        {!loading && !error && (
          <>
            <PageDivider />

            <div
              className="font-mono-label text-[10px] uppercase tracking-[0.14em] sm:text-[11px]"
              aria-label="Archive metadata"
            >
              <div className="flex flex-col gap-3 sm:hidden">
                <MetadataStat
                  label="FRAMES KEPT"
                  value={stats.frameCount.toString()}
                />
                <MetadataStat
                  label="SINCE"
                  value={stats.sinceLabel ?? '—'}
                />
                <MetadataStat
                  label="LAST DEVELOPED"
                  value={stats.lastDevelopedLabel ?? '—'}
                />
              </div>

              <div className="hidden flex-wrap items-center gap-x-3 gap-y-2 sm:flex">
                <MetadataStat
                  label="FRAMES KEPT"
                  value={stats.frameCount.toString()}
                />
                <span className="text-border" aria-hidden="true">
                  ·
                </span>
                <MetadataStat label="SINCE" value={stats.sinceLabel ?? '—'} />
                <span className="text-border" aria-hidden="true">
                  ·
                </span>
                <MetadataStat
                  label="LAST DEVELOPED"
                  value={stats.lastDevelopedLabel ?? '—'}
                />
              </div>
            </div>

            <PageDivider />

            <ul className="space-y-3 text-sm leading-relaxed text-text-muted">
              {HOW_THIS_WORKS.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="shrink-0 text-accent" aria-hidden="true">
                    —
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <p className="mt-16 text-center font-mono-label text-[10px] tracking-[0.12em] text-text-muted sm:mt-20">
              — kept, an ongoing archive
            </p>
          </>
        )}
      </main>
    </div>
  )
}
