import {
  monthFillOpacity,
  monthKeyFromYearMonth,
  type YearSummary,
} from '../lib/utils'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

interface YearOverviewSectionProps {
  years: YearSummary[]
  onSelectYear: (year: string) => void
  onSelectMonth: (monthKey: string) => void
}

export function YearOverviewSection({
  years,
  onSelectYear,
  onSelectMonth,
}: YearOverviewSectionProps) {
  if (years.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {years.map((summary) => (
        <YearCard
          key={summary.year}
          summary={summary}
          onSelectYear={onSelectYear}
          onSelectMonth={onSelectMonth}
        />
      ))}
    </div>
  )
}

function YearCard({
  summary,
  onSelectYear,
  onSelectMonth,
}: {
  summary: YearSummary
  onSelectYear: (year: string) => void
  onSelectMonth: (monthKey: string) => void
}) {
  const frameLabel = summary.totalFrames === 1 ? '1 frame' : `${summary.totalFrames} frames`

  return (
    <article className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/60">
      <button
        type="button"
        onClick={() => onSelectYear(summary.year)}
        className="w-full text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        aria-label={`View ${summary.year} by month, ${frameLabel}`}
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          {summary.year}
        </h2>
      </button>

      <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2">
        {summary.monthCounts.map((count, monthIndex) => {
          const filled = count > 0
          const opacity = monthFillOpacity(count, summary.maxMonthCount)
          const monthKey = monthKeyFromYearMonth(summary.year, monthIndex)
          const label = `${MONTH_LABELS[monthIndex]} ${summary.year}`

          if (!filled) {
            return (
              <button
                key={monthKey}
                type="button"
                onClick={() => onSelectYear(summary.year)}
                className="aspect-square rounded-sm bg-[#2a2c33] focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                title={`${label}: 0 frames`}
                aria-label={`View ${summary.year} by month`}
              />
            )
          }

          return (
            <button
              key={monthKey}
              type="button"
              title={`${label}: ${count} ${count === 1 ? 'frame' : 'frames'}`}
              aria-label={`View ${label}, ${count} frames`}
              onClick={() => onSelectMonth(monthKey)}
              className="aspect-square rounded-sm bg-accent transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              style={{ opacity }}
            />
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelectYear(summary.year)}
        className="mt-4 w-full text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <p className="font-mono-label text-[10px] tracking-wide text-text-muted">
          {frameLabel}
        </p>
      </button>
    </article>
  )
}
