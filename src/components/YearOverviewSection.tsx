import { ImagePlus } from 'lucide-react'
import type { YearSummary } from '../lib/utils'
import { SmartImage } from './SmartImage'

interface YearOverviewSectionProps {
  years: YearSummary[]
  coverByYear: Map<number, string>
  isAdmin?: boolean
  onSelectYear: (year: string) => void
  onEditCover?: (year: string) => void
}

export function YearOverviewSection({
  years,
  coverByYear,
  isAdmin = false,
  onSelectYear,
  onEditCover,
}: YearOverviewSectionProps) {
  if (years.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {years.map((summary) => {
        const yearNum = Number(summary.year)
        const coverUrl =
          coverByYear.get(yearNum) ?? summary.fallbackImageUrl ?? null
        const frameLabel =
          summary.totalFrames === 1 ? '1' : String(summary.totalFrames)

        return (
          <article
            key={summary.year}
            className="group relative aspect-4/5 overflow-hidden rounded-xl border border-border bg-surface hover:border-accent/80 hover:scale-103 hover:shadow-2xl transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => onSelectYear(summary.year)}
              className="absolute inset-0 z-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-inset"
              aria-label={`View photos from ${summary.year}`}
            >
              {coverUrl ? (
                <SmartImage src={coverUrl} alt="" fill />
              ) : (
                <div className="absolute inset-0 bg-[#2a2c33]" />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/50 to-transparent px-4 pb-4 pt-16">
                <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  {summary.year}
                </h2>
              </div>
            </button>

            <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-accent px-2.5 py-1 font-mono-label text-[10px] font-medium tracking-wide text-background">
              {frameLabel}
            </span>

            {isAdmin && onEditCover && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditCover(summary.year)
                }}
                aria-label={`Edit ${summary.year} cover`}
                title="Edit cover"
                className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded border border-border bg-surface/90 text-text-muted opacity-0 transition hover:border-accent hover:text-accent group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                <ImagePlus size={15} strokeWidth={1.75} />
              </button>
            )}
          </article>
        )
      })}
    </div>
  )
}
