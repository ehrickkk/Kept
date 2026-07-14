import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { PhotoEntry } from '../types'

export interface AboutPageStats {
  frameCount: number
  sinceLabel: string | null
  lastDevelopedLabel: string | null
}

export function sortByCreatedAtDesc(photos: PhotoEntry[]): PhotoEntry[] {
  return [...photos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function groupPhotosByMonth(photos: PhotoEntry[]): Map<string, PhotoEntry[]> {
  const groups = new Map<string, PhotoEntry[]>()

  for (const photo of photos) {
    const monthKey = format(parseISO(photo.date), 'yyyy-MM')
    const existing = groups.get(monthKey)
    if (existing) {
      existing.push(photo)
    } else {
      groups.set(monthKey, [photo])
    }
  }

  return groups
}

export interface YearSummary {
  year: string
  totalFrames: number
  /** Photo counts for Jan–Dec (index 0 = January) */
  monthCounts: number[]
  maxMonthCount: number
  /** Most recent diary photo for the year — used when no custom cover is set */
  fallbackImageUrl: string | null
}

export function groupPhotosByYear(photos: PhotoEntry[]): YearSummary[] {
  const byYear = new Map<
    string,
    { monthCounts: number[]; latestPhoto: PhotoEntry | null }
  >()

  for (const photo of photos) {
    const parsed = parseISO(photo.date)
    const year = format(parsed, 'yyyy')
    const monthIndex = parsed.getMonth()

    let entry = byYear.get(year)
    if (!entry) {
      entry = {
        monthCounts: Array.from({ length: 12 }, () => 0),
        latestPhoto: null,
      }
      byYear.set(year, entry)
    }

    entry.monthCounts[monthIndex] += 1

    if (
      !entry.latestPhoto ||
      parseISO(photo.date).getTime() > parseISO(entry.latestPhoto.date).getTime() ||
      (photo.date === entry.latestPhoto.date &&
        new Date(photo.created_at).getTime() >
          new Date(entry.latestPhoto.created_at).getTime())
    ) {
      entry.latestPhoto = photo
    }
  }

  return [...byYear.entries()]
    .map(([year, { monthCounts, latestPhoto }]) => {
      const totalFrames = monthCounts.reduce((sum, count) => sum + count, 0)
      const maxMonthCount = Math.max(...monthCounts, 0)
      return {
        year,
        totalFrames,
        monthCounts,
        maxMonthCount,
        fallbackImageUrl: latestPhoto?.image_url ?? null,
      }
    })
    .sort((a, b) => b.year.localeCompare(a.year))
}

export function photosForYear(photos: PhotoEntry[], year: string): PhotoEntry[] {
  return photos
    .filter((photo) => format(parseISO(photo.date), 'yyyy') === year)
    .sort((a, b) => {
      const dateDiff = parseISO(b.date).getTime() - parseISO(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

export function monthKeyFromYearMonth(year: string, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function monthFillOpacity(count: number, maxCount: number): number {
  if (count <= 0 || maxCount <= 0) return 0
  return 0.28 + 0.72 * (count / maxCount)
}

export function formatMonthHeader(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return format(date, 'MMMM yyyy')
}

export function formatFrameDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM.dd.yyyy').toUpperCase()
}

export function formatDisplayDate(dateStr: string): string {
  return formatFrameDate(dateStr)
}

export function formatSinceMonth(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM yyyy').toUpperCase()
}

export function getAboutPageStats(photos: PhotoEntry[]): AboutPageStats {
  if (photos.length === 0) {
    return {
      frameCount: 0,
      sinceLabel: null,
      lastDevelopedLabel: null,
    }
  }

  const earliestByDate = [...photos].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
  )[0]

  const mostRecentUpload = sortByCreatedAtDesc(photos)[0]

  return {
    frameCount: photos.length,
    sinceLabel: formatSinceMonth(earliestByDate.date),
    lastDevelopedLabel: formatDistanceToNow(parseISO(mostRecentUpload.created_at), {
      addSuffix: true,
    }),
  }
}
