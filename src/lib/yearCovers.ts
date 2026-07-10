import { extractStoragePath, PHOTOS_BUCKET } from './photos'
import { supabase } from './supabase'
import type { YearCover } from '../types'

export async function fetchYearCovers(): Promise<YearCover[]> {
  const { data, error } = await supabase
    .from('year_covers')
    .select('*')
    .order('year', { ascending: false })

  if (error) throw error
  return (data ?? []) as YearCover[]
}

export async function upsertYearCover(
  year: number,
  file: File,
  previousImageUrl: string | null,
): Promise<YearCover> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filePath = `year-covers/${year}.${ext}`

  if (previousImageUrl) {
    const oldPath = extractStoragePath(previousImageUrl)
    if (oldPath && oldPath !== filePath) {
      const { error: removeError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .remove([oldPath])
      if (removeError) throw removeError
    }
  }

  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from(PHOTOS_BUCKET)
    .getPublicUrl(filePath)

  const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`
  const updatedAt = new Date().toISOString()

  const { data, error: upsertError } = await supabase
    .from('year_covers')
    .upsert(
      {
        year,
        image_url: imageUrl,
        updated_at: updatedAt,
      },
      { onConflict: 'year' },
    )
    .select()
    .single()

  if (upsertError) throw upsertError
  return data as YearCover
}

export async function resetYearCover(
  year: number,
  imageUrl: string | null,
): Promise<void> {
  if (imageUrl) {
    const filePath = extractStoragePath(imageUrl)
    if (filePath) {
      const { error: removeError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .remove([filePath])
      if (removeError) throw removeError
    }
  }

  const { error } = await supabase.from('year_covers').delete().eq('year', year)
  if (error) throw error
}
