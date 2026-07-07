import { supabase } from './supabase'
import type { PhotoEntry } from '../types'

const BUCKET = 'photos'

export async function fetchPhotos(): Promise<PhotoEntry[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as PhotoEntry[]
}

export async function uploadPhoto(
  file: File,
  caption: string,
  date: string,
  tag?: string,
): Promise<PhotoEntry> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filePath = `${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

  const { data, error: insertError } = await supabase
    .from('photos')
    .insert({
      image_url: urlData.publicUrl,
      caption,
      date,
      tag: tag || null,
    })
    .select()
    .single()

  if (insertError) throw insertError
  return data as PhotoEntry
}

export function extractStoragePath(imageUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = imageUrl.indexOf(marker)
  if (index === -1) return null
  return imageUrl.slice(index + marker.length)
}

export async function deletePhoto(photo: PhotoEntry): Promise<void> {
  const filePath = extractStoragePath(photo.image_url)
  if (filePath) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([filePath])
    if (storageError) throw storageError
  }

  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
}
