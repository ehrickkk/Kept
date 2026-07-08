import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilmstripPreview } from '../components/FilmstripPreview'
import { useTypewriter } from '../hooks/useTypewriter'
import { fetchPhotos } from '../lib/photos'
import { getAboutPageStats, sortByCreatedAtDesc } from '../lib/utils'
import type { PhotoEntry } from '../types'

const TYPEWRITER_PHRASES = [
  'a place to keep what matters.',
  'no filters. just frames.',
  'one moment at a time.',
  'nothing curated. nothing forced.',
] as const

function LandingMetadataStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-x-1.5">
      <span>{label}:</span>
      <span className="text-accent">{value}</span>
    </span>
  )
}

export function LandingPage() {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const typewriterText = useTypewriter(TYPEWRITER_PHRASES)

  const loadPhotos = useCallback(async () => {
    try {
      const data = await fetchPhotos()
      setPhotos(data)
    } catch {
      // Filmstrip and footer degrade gracefully without blocking the hero
    }
  }, [])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

  const stats = useMemo(() => getAboutPageStats(photos), [photos])
  const recentPhotos = useMemo(() => sortByCreatedAtDesc(photos), [photos])
  const backgroundPhoto = recentPhotos[0]?.image_url ?? null

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {backgroundPhoto && (
        <img
          src={backgroundPhoto}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] blur-sm"
        />
      )}

      <div className="noise-texture pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-16 text-center sm:px-8 sm:pb-12 sm:pt-20">
          <h1 className="font-display text-6xl font-bold tracking-[0.18em] text-text-primary sm:text-7xl md:text-8xl lg:text-9xl">
            kept
          </h1>

          <p
            className="mt-6 min-h-[1.5em] font-mono-label text-xs tracking-wide text-text-muted sm:mt-8 sm:text-sm"
            aria-live="polite"
          >
            {typewriterText}
            <span className="typewriter-cursor text-accent" aria-hidden="true">
              |
            </span>
          </p>

          <Link
            to="/home"
            className="mt-10 inline-block rounded border border-accent px-6 py-2.5 font-mono-label text-[11px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/10 sm:mt-12 sm:px-8 sm:py-3 sm:text-xs"
          >
            Enter the archive
          </Link>
        </section>

        <FilmstripPreview photos={recentPhotos} />

        <footer className="px-6 pb-8 pt-2 text-center font-mono-label text-[10px] uppercase tracking-[0.14em] text-text-muted sm:pb-10 sm:text-[11px]">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
            <LandingMetadataStat
              label="FRAMES KEPT"
              value={stats.frameCount.toString()}
            />
            <span className="hidden text-border sm:inline" aria-hidden="true">
              ·
            </span>
            <LandingMetadataStat
              label="SINCE"
              value={stats.sinceLabel ?? '—'}
            />
          </div>
        </footer>
      </div>
    </div>
  )
}
