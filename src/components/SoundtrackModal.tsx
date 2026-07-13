import { AnimatePresence, motion } from 'framer-motion'
import { Music, Pause, Play, Trash2, X } from 'lucide-react'
import {
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useSoundtrackPlayer } from '../hooks/useSoundtrackPlayer'
import { deleteSoundtrack, upsertSoundtrack } from '../lib/soundtracks'
import type { Soundtrack, SoundtrackScope } from '../types'

const MAX_SELECTION_SECONDS = 360
const MIN_SELECTION_SECONDS = 1

interface SoundtrackModalProps {
  open: boolean
  scope: SoundtrackScope
  scopeKey: string
  /** Human-readable label, e.g. "March 2025" or "2025" */
  label: string
  existing: Soundtrack | null
  onClose: () => void
  onSaved: (track: Soundtrack | null) => void
}

type TrimHandle = 'start' | 'end'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function formatTime(seconds: number): string {
  const total = Math.max(0, seconds)
  const mins = Math.floor(total / 60)
  const secs = total - mins * 60
  return `${mins}:${secs.toFixed(1).padStart(4, '0')}`
}

export function SoundtrackModal({
  open,
  scope,
  scopeKey,
  label,
  existing,
  onClose,
  onSaved,
}: SoundtrackModalProps) {
  const { stopAll } = useSoundtrackPlayer()

  const [file, setFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [rangeStart, setRangeStart] = useState(0)
  const [rangeEnd, setRangeEnd] = useState(MAX_SELECTION_SECONDS)
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragging, setDragging] = useState<TrimHandle | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewRef = useRef<HTMLAudioElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  /** Whether the loaded metadata belongs to a freshly picked file */
  const freshFileRef = useRef(false)

  const audioSrc = objectUrl ?? existing?.audio_url ?? null

  const resetLocal = useCallback(() => {
    previewRef.current?.pause()
    setPreviewPlaying(false)
    setFile(null)
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setAudioDuration(null)
    setDragOver(false)
    setDragging(null)
    setError(null)
    freshFileRef.current = false
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    if (busy) return
    resetLocal()
    onClose()
  }, [busy, resetLocal, onClose])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) handleClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, busy, handleClose])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const setSelectedFile = (selected: File) => {
    const isMp3 =
      selected.type === 'audio/mpeg' ||
      selected.type === 'audio/mp3' ||
      selected.name.toLowerCase().endsWith('.mp3')
    if (!isMp3) {
      setError('Please choose an mp3 file')
      return
    }
    previewRef.current?.pause()
    setPreviewPlaying(false)
    setAudioDuration(null)
    setError(null)
    freshFileRef.current = true
    setFile(selected)
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(selected)
    })
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (busy) return
    const dropped = e.dataTransfer.files[0]
    if (dropped) setSelectedFile(dropped)
  }

  const handleMetadataLoaded = () => {
    const audio = previewRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    const duration = audio.duration
    setAudioDuration(duration)

    if (!freshFileRef.current && existing) {
      const start = clamp(existing.start_seconds, 0, Math.max(0, duration - MIN_SELECTION_SECONDS))
      const end = clamp(
        existing.start_seconds + existing.duration_seconds,
        start + MIN_SELECTION_SECONDS,
        Math.min(duration, start + MAX_SELECTION_SECONDS),
      )
      setRangeStart(start)
      setRangeEnd(end)
    } else {
      setRangeStart(0)
      setRangeEnd(Math.min(MAX_SELECTION_SECONDS, duration))
    }
    freshFileRef.current = false
  }

  const timeFromClientX = (clientX: number): number => {
    const bar = barRef.current
    if (!bar || audioDuration === null) return 0
    const rect = bar.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    return ratio * audioDuration
  }

  const beginDrag = (handle: TrimHandle) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (busy || audioDuration === null) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(handle)
  }

  const handleDragMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging || audioDuration === null) return
    const t = timeFromClientX(e.clientX)
    if (dragging === 'start') {
      setRangeStart(
        clamp(t, Math.max(0, rangeEnd - MAX_SELECTION_SECONDS), rangeEnd - MIN_SELECTION_SECONDS),
      )
    } else {
      setRangeEnd(
        clamp(
          t,
          rangeStart + MIN_SELECTION_SECONDS,
          Math.min(audioDuration, rangeStart + MAX_SELECTION_SECONDS),
        ),
      )
    }
  }

  const endDrag = () => setDragging(null)

  const togglePreview = () => {
    const audio = previewRef.current
    if (!audio || audioDuration === null) return

    if (previewPlaying) {
      audio.pause()
      setPreviewPlaying(false)
      return
    }

    stopAll()
    audio.currentTime = rangeStart
    void audio
      .play()
      .then(() => setPreviewPlaying(true))
      .catch(() => setError('Preview could not start playing'))
  }

  const handlePreviewTimeUpdate = () => {
    const audio = previewRef.current
    if (!audio || audio.paused) return
    if (audio.currentTime >= rangeEnd || audio.currentTime < rangeStart - 0.5) {
      audio.currentTime = rangeStart
    }
  }

  const handlePreviewEnded = () => {
    const audio = previewRef.current
    if (!audio || !previewPlaying) return
    audio.currentTime = rangeStart
    void audio.play().catch(() => setPreviewPlaying(false))
  }

  const handleSave = async () => {
    if (audioDuration === null) return
    if (!file && !existing) {
      setError('Please add an mp3 file first')
      return
    }

    previewRef.current?.pause()
    setPreviewPlaying(false)
    setBusy(true)
    setError(null)
    try {
      const saved = await upsertSoundtrack({
        scope,
        scopeKey,
        file,
        previousAudioUrl: existing?.audio_url ?? null,
        startSeconds: Math.round(rangeStart * 100) / 100,
        durationSeconds: Math.round((rangeEnd - rangeStart) * 100) / 100,
      })
      onSaved(saved)
      resetLocal()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving soundtrack failed')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    if (!existing || busy) return
    if (!window.confirm(`Remove the soundtrack for ${label}?`)) return

    previewRef.current?.pause()
    setPreviewPlaying(false)
    setBusy(true)
    setError(null)
    try {
      await deleteSoundtrack(existing)
      onSaved(null)
      resetLocal()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Removing soundtrack failed')
    } finally {
      setBusy(false)
    }
  }

  const hasAudio = audioSrc !== null
  const trimReady = hasAudio && audioDuration !== null
  const startPct = trimReady ? (rangeStart / audioDuration) * 100 : 0
  const endPct = trimReady ? (rangeEnd / audioDuration) * 100 : 100

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Close modal"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${label} soundtrack`}
            className="relative z-10 w-full max-w-md rounded-[16px] border border-border bg-surface p-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="absolute right-4 top-4 text-text-muted transition hover:text-text-primary disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="font-display mb-1 text-xl font-semibold text-text-primary">
              Soundtrack
            </h2>
            <p className="mb-5 font-mono-label text-[10px] uppercase tracking-wide text-text-muted">
              {label}
            </p>

            {hasAudio && (
              <audio
                ref={previewRef}
                src={audioSrc ?? undefined}
                preload="metadata"
                onLoadedMetadata={handleMetadataLoaded}
                onTimeUpdate={handlePreviewTimeUpdate}
                onEnded={handlePreviewEnded}
                onPause={() => setPreviewPlaying(false)}
              />
            )}

            <div className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (busy) return
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (!busy) setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => {
                  if (!busy) fileInputRef.current?.click()
                }}
                className={`flex min-h-[92px] cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed p-4 transition-colors ${
                  dragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-background hover:border-accent/50'
                } ${busy ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mpeg,.mp3"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (selected) setSelectedFile(selected)
                  }}
                />
                <Music size={18} className="text-text-muted" aria-hidden="true" />
                {file ? (
                  <p className="max-w-full truncate text-center text-sm text-text-primary">
                    {file.name}
                  </p>
                ) : existing ? (
                  <p className="text-center text-sm text-text-muted">
                    A song is set — drop a new mp3 here to replace it
                  </p>
                ) : (
                  <p className="text-center text-sm text-text-muted">
                    Drag an mp3 here or click to browse
                  </p>
                )}
              </div>

              {hasAudio && !trimReady && (
                <p className="text-center font-mono-label text-[10px] uppercase tracking-wide text-text-muted">
                  Loading audio…
                </p>
              )}

              {trimReady && (
                <div className="rounded border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between font-mono-label text-[10px] tracking-wide text-text-muted">
                    <span>{formatTime(rangeStart)}</span>
                    <span className="text-accent">
                      {(rangeEnd - rangeStart).toFixed(1)}s selected
                    </span>
                    <span>{formatTime(rangeEnd)}</span>
                  </div>

                  <div
                    ref={barRef}
                    className="relative h-8 touch-none select-none"
                  >
                    <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border/50" />
                    <div
                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent/70"
                      style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                    />
                    <button
                      type="button"
                      onPointerDown={beginDrag('start')}
                      onPointerMove={handleDragMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      aria-label={`Start time: ${formatTime(rangeStart)}`}
                      className="absolute top-1/2 z-10 h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-sm border border-background bg-accent transition-transform hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      style={{ left: `${startPct}%` }}
                    />
                    <button
                      type="button"
                      onPointerDown={beginDrag('end')}
                      onPointerMove={handleDragMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      aria-label={`End time: ${formatTime(rangeEnd)}`}
                      className="absolute top-1/2 z-10 h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-sm border border-background bg-accent transition-transform hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      style={{ left: `${endPct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={togglePreview}
                      disabled={busy}
                      className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-text-muted transition hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      {previewPlaying ? (
                        <Pause size={12} fill="currentColor" />
                      ) : (
                        <Play size={12} fill="currentColor" />
                      )}
                      {previewPlaying ? 'Stop preview' : 'Preview loop'}
                    </button>
                    <span className="font-mono-label text-[10px] tracking-wide text-text-muted">
                      max {MAX_SELECTION_SECONDS}s
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={busy || !trimReady || (!file && !existing)}
                className="btn-primary"
              >
                {busy && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                )}
                {busy ? 'Saving...' : 'Save soundtrack'}
              </button>

              {existing && (
                <button
                  type="button"
                  onClick={() => void handleRemove()}
                  disabled={busy}
                  className="btn-secondary flex items-center justify-center gap-2 hover:border-red-500! hover:text-red-400!"
                >
                  <Trash2 size={14} />
                  Remove song
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
