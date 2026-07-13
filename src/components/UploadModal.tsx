import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { Check, Loader2, RotateCcw, X } from 'lucide-react'
import { type DragEvent, type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { uploadPhoto } from '../lib/photos'
import type { PhotoEntry } from '../types'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (photos: PhotoEntry[]) => void
}

type ItemStatus = 'idle' | 'uploading' | 'done' | 'error'

interface BatchItem {
  id: string
  file: File
  previewUrl: string
  caption: string
  status: ItemStatus
  error: string | null
}

function createBatchItem(file: File): BatchItem {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    caption: '',
    status: 'idle',
    error: null,
  }
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const [items, setItems] = useState<BatchItem[]>([])
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tag, setTag] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const resetForm = useCallback(() => {
    setItems((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.previewUrl)
      return []
    })
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setTag('')
    setDragOver(false)
    setFeedback(null)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    if (uploading) return
    resetForm()
    onClose()
  }, [uploading, resetForm, onClose])

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const images = Array.from(fileList).filter(isImageFile)
    if (images.length === 0) return

    setItems((prev) => [...prev, ...images.map(createBatchItem)])
    setFeedback(null)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  const updateCaption = useCallback((id: string, caption: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption } : item)),
    )
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
      for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl)
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

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
    if (uploading) return
    addFiles(e.dataTransfer.files)
  }

  const setItemStatus = (
    id: string,
    status: ItemStatus,
    error: string | null = null,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, error } : item,
      ),
    )
  }

  const uploadOne = async (
    item: BatchItem,
    sharedDate: string,
    sharedTag: string,
  ): Promise<PhotoEntry | null> => {
    setItemStatus(item.id, 'uploading')
    try {
      const photo = await uploadPhoto(
        item.file,
        item.caption,
        sharedDate,
        sharedTag || undefined,
      )
      setItemStatus(item.id, 'done')
      return photo
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setItemStatus(item.id, 'error', message)
      return null
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      showFeedback('error', 'Please select at least one image')
      return
    }

    setUploading(true)
    setFeedback(null)

    const pending = items.filter(
      (item) => item.status === 'idle' || item.status === 'error',
    )
    const uploaded: PhotoEntry[] = []

    for (const item of pending) {
      const photo = await uploadOne(item, date, tag)
      if (photo) uploaded.push(photo)
    }

    setUploading(false)

    if (uploaded.length > 0) {
      onSuccess(uploaded)
    }

    const failedCount = pending.length - uploaded.length
    if (failedCount === 0) {
      showFeedback('success', uploaded.length === 1 ? 'Uploaded' : `Uploaded ${uploaded.length}`, true)
      setTimeout(() => {
        resetForm()
        onClose()
      }, 800)
    } else if (uploaded.length > 0) {
      showFeedback(
        'error',
        `${uploaded.length} uploaded, ${failedCount} failed — retry failed items`,
      )
    } else {
      showFeedback('error', 'All uploads failed — retry to try again')
    }
  }

  const handleRetry = async (id: string) => {
    const item = items.find((entry) => entry.id === id)
    if (!item || item.status !== 'error' || uploading) return

    const remainingErrorsBefore = items.filter(
      (entry) => entry.id !== id && entry.status === 'error',
    ).length

    setUploading(true)
    setFeedback(null)
    const photo = await uploadOne(item, date, tag)
    setUploading(false)

    if (!photo) return

    onSuccess([photo])

    if (remainingErrorsBefore === 0) {
      showFeedback('success', 'Uploaded', true)
      setTimeout(() => {
        resetForm()
        onClose()
      }, 800)
    }
  }

  const pendingCount = items.filter(
    (item) => item.status === 'idle' || item.status === 'error',
  ).length
  const submitLabel =
    uploading
      ? 'Uploading...'
      : items.some((item) => item.status === 'error')
        ? `Retry ${pendingCount}`
        : items.length > 1
          ? `Upload ${items.length}`
          : 'Upload'

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
            aria-label="Upload photos"
            className="relative z-10 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[16px] border border-border bg-surface p-6"
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
              className="tap-target absolute right-4 top-4 text-text-muted transition hover:text-text-primary disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="font-display mb-5 pr-10 text-xl font-semibold text-text-primary">
              Upload
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (uploading) return
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (!uploading) setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => {
                  if (!uploading) fileInputRef.current?.click()
                }}
                className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded border border-dashed p-4 transition-colors ${
                  dragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-background hover:border-accent/50'
                } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
                <p className="text-center text-sm text-text-muted">
                  {items.length === 0
                    ? 'Drag photos here or click to browse'
                    : 'Add more photos'}
                </p>
                <p className="mt-1 text-center font-mono-label text-[10px] tracking-wide text-text-muted">
                  Multiple files supported
                </p>
              </div>

              {items.length > 0 && (
                <div className="grid max-h-[320px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-1.5">
                      <div className="relative aspect-4/5 overflow-hidden rounded border border-border bg-background">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />

                        {item.status === 'uploading' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                            <Loader2 size={18} className="animate-spin text-accent" />
                          </div>
                        )}

                        {item.status === 'done' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                            <Check size={18} className="text-green-400" />
                          </div>
                        )}

                        {item.status === 'error' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 px-2">
                            <p className="text-center text-[10px] leading-tight text-red-400">
                              {item.error ?? 'Failed'}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleRetry(item.id)
                              }}
                              disabled={uploading}
                              className="inline-flex items-center gap-1 rounded border border-border bg-surface/90 px-2 py-0.5 font-mono-label text-[10px] tracking-wide text-text-primary transition hover:border-accent hover:text-accent disabled:opacity-50"
                            >
                              <RotateCcw size={10} />
                              Retry
                            </button>
                          </div>
                        )}

                        {!uploading && item.status === 'idle' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeItem(item.id)
                            }}
                            className="tap-target absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded border border-border bg-surface/90 text-text-muted transition hover:border-red-500 hover:text-red-400"
                            aria-label={`Remove ${item.file.name}`}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => updateCaption(item.id, e.target.value)}
                        placeholder="Caption (optional)"
                        disabled={uploading || item.status === 'done'}
                        className="input-dark px-2 py-1.5 text-xs"
                        aria-label={`Caption for ${item.file.name}`}
                      />
                    </div>
                  ))}
                </div>
              )}

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
                  disabled={uploading}
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
                  disabled={uploading}
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

              <button
                type="submit"
                disabled={uploading || items.length === 0}
                className="btn-primary"
              >
                {uploading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                )}
                {submitLabel}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
