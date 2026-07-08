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
