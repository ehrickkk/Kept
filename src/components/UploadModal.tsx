import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { type DragEvent, type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { uploadPhoto } from '../lib/photos'
import type { PhotoEntry } from '../types'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (photo: PhotoEntry) => void
}

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tag, setTag] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetForm = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    setCaption('')
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setTag('')
    setDragOver(false)
    setFeedback(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    if (uploading) return
    resetForm()
    onClose()
  }, [uploading, resetForm, onClose])

  const setFileWithPreview = useCallback((selected: File) => {
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }, [])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !uploading) handleClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, uploading, handleClose])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [previewUrl])

  const showFeedback = (type: 'success' | 'error', message: string, autoDismiss = false) => {
    setFeedback({ type, message })
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    if (autoDismiss) {
      feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type.startsWith('image/')) {
      setFileWithPreview(dropped)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      showFeedback('error', 'Please select an image')
      return
    }

    setUploading(true)
    setFeedback(null)

    try {
      const photo = await uploadPhoto(file, caption, date, tag || undefined)
      showFeedback('success', 'Uploaded', true)
      onSuccess(photo)
      setTimeout(() => {
        resetForm()
        onClose()
      }, 800)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      showFeedback('error', message)
    } finally {
      setUploading(false)
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
            aria-label="Upload photo"
            className="relative z-10 w-full max-w-md rounded border border-border bg-surface p-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="absolute right-4 top-4 text-text-muted transition hover:text-text-primary disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="font-display mb-5 text-xl font-semibold text-text-primary">
              Upload
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded border border-dashed p-4 transition-colors ${
                  dragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-background hover:border-accent/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (selected) setFileWithPreview(selected)
                  }}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-28 object-contain"
                  />
                ) : (
                  <p className="text-center text-sm text-text-muted">
                    Drag a photo here or click to browse
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="upload-caption" className="mb-1 block text-xs text-text-muted">
                  Caption
                </label>
                <input
                  id="upload-caption"
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption"
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label htmlFor="upload-date" className="mb-1 block font-mono-label text-[10px] uppercase tracking-wide text-text-muted">
                  Date
                </label>
                <input
                  id="upload-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="input-dark font-mono-label text-xs"
                />
              </div>

              <div>
                <label htmlFor="upload-tag" className="mb-1 block font-mono-label text-[10px] uppercase tracking-wide text-text-muted">
                  Tag <span className="normal-case">(optional)</span>
                </label>
                <input
                  id="upload-tag"
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="tag"
                  className="input-dark font-mono-label text-xs"
                />
              </div>

              {feedback && (
                <p
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                  className={`text-sm ${
                    feedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {feedback.message}
                </p>
              )}

              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                )}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
