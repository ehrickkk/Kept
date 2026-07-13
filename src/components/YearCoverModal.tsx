import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { type DragEvent, type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { resetYearCover, upsertYearCover } from '../lib/yearCovers'
import type { YearCover } from '../types'

interface YearCoverModalProps {
  open: boolean
  year: string
  currentCoverUrl: string | null
  hasCustomCover: boolean
  onClose: () => void
  onSaved: (cover: YearCover | null) => void
}

export function YearCoverModal({
  open,
  year,
  currentCoverUrl,
  hasCustomCover,
  onClose,
  onSaved,
}: YearCoverModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetLocal = useCallback(() => {
    setFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setDragOver(false)
    setError(null)
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
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const setSelectedFile = (selected: File) => {
    if (!selected.type.startsWith('image/')) return
    setFile(selected)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(selected)
    })
    setError(null)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setSelectedFile(dropped)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select an image')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const cover = await upsertYearCover(
        Number(year),
        file,
        hasCustomCover ? currentCoverUrl : null,
      )
      onSaved(cover)
      resetLocal()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async () => {
    if (!hasCustomCover || busy) return
    if (!window.confirm(`Reset ${year} cover to the default diary photo?`)) return

    setBusy(true)
    setError(null)
    try {
      await resetYearCover(Number(year), currentCoverUrl)
      onSaved(null)
      resetLocal()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setBusy(false)
    }
  }

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
            aria-label={`Edit ${year} cover`}
            className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[16px] border border-border bg-surface p-5 sm:p-6"
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
              className="tap-target absolute right-4 top-4 text-text-muted transition hover:text-text-primary disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="font-display mb-1 text-xl font-semibold text-text-primary">
              Edit cover
            </h2>
            <p className="mb-5 font-mono-label text-[10px] uppercase tracking-wide text-text-muted">
              {year}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded border border-dashed p-4 transition-colors ${
                  dragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-background hover:border-accent/50'
                } ${busy ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (selected) setSelectedFile(selected)
                  }}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    className="max-h-[200px] object-contain"
                  />
                ) : (
                  <p className="text-center text-sm text-text-muted">
                    Drag a cover image here or click to browse
                  </p>
                )}
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy || !file} className="btn-primary">
                {busy && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                )}
                {busy ? 'Uploading...' : 'Upload'}
              </button>

              {hasCustomCover && (
                <button
                  type="button"
                  onClick={() => void handleReset()}
                  disabled={busy}
                  className="btn-secondary"
                >
                  Reset to default
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
