import { supabase } from './supabase'
import type { Soundtrack, SoundtrackScope } from '../types'

export const AUDIO_BUCKET = 'audio'

export function extractAudioStoragePath(audioUrl: string): string | null {
  const marker = `/storage/v1/object/public/${AUDIO_BUCKET}/`
  const withoutQuery = audioUrl.split('?')[0] ?? audioUrl
  const index = withoutQuery.indexOf(marker)
  if (index === -1) return null
  return withoutQuery.slice(index + marker.length)
}

export async function fetchSoundtracks(): Promise<Soundtrack[]> {
  const { data, error } = await supabase.from('soundtracks').select('*')

  if (error) throw error
  return (data ?? []) as Soundtrack[]
}

export interface UpsertSoundtrackInput {
  scope: SoundtrackScope
  scopeKey: string
  /** New audio file, or null to keep the existing one and only update the trim */
  file: File | null
  previousAudioUrl: string | null
  startSeconds: number
  durationSeconds: number
}

export async function upsertSoundtrack(
  input: UpsertSoundtrackInput,
): Promise<Soundtrack> {
  let audioUrl = input.previousAudioUrl

  if (input.file) {
    const ext = input.file.name.split('.').pop()?.toLowerCase() ?? 'mp3'
    const filePath = `${input.scope}/${input.scopeKey}.${ext}`

    if (input.previousAudioUrl) {
      const oldPath = extractAudioStoragePath(input.previousAudioUrl)
      if (oldPath && oldPath !== filePath) {
        const { error: removeError } = await supabase.storage
          .from(AUDIO_BUCKET)
          .remove([oldPath])
        if (removeError) throw removeError
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, input.file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(filePath)

    audioUrl = `${urlData.publicUrl}?t=${Date.now()}`
  }

  if (!audioUrl) {
    throw new Error('No audio file provided')
  }

  const { data, error: upsertError } = await supabase
    .from('soundtracks')
    .upsert(
      {
        scope: input.scope,
        scope_key: input.scopeKey,
        audio_url: audioUrl,
        start_seconds: input.startSeconds,
        duration_seconds: input.durationSeconds,
      },
      { onConflict: 'scope,scope_key' },
    )
    .select()
    .single()

  if (upsertError) throw upsertError
  return data as Soundtrack
}

export async function deleteSoundtrack(track: Soundtrack): Promise<void> {
  const filePath = extractAudioStoragePath(track.audio_url)
  if (filePath) {
    const { error: removeError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([filePath])
    if (removeError) throw removeError
  }

  const { error } = await supabase
    .from('soundtracks')
    .delete()
    .eq('scope', track.scope)
    .eq('scope_key', track.scope_key)

  if (error) throw error
}
