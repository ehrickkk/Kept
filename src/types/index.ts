export interface PhotoEntry {
  id: string
  image_url: string
  caption: string
  date: string
  tag?: string
  created_at: string
}

export interface YearCover {
  year: number
  image_url: string
  updated_at: string
}

export type SoundtrackScope = 'month' | 'year'

export interface Soundtrack {
  scope: SoundtrackScope
  /** 'yyyy-MM' for months, 'yyyy' for years */
  scope_key: string
  audio_url: string
  start_seconds: number
  duration_seconds: number
}

export function soundtrackKey(scope: SoundtrackScope, scopeKey: string): string {
  return `${scope}:${scopeKey}`
}
