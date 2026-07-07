import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useCallback, useEffect } from 'react'

interface AccountModalProps {
  open: boolean
  email: string
  onClose: () => void
  onLogout: () => Promise<void>
}

export function AccountModal({ open, email, onClose, onLogout }: AccountModalProps) {
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleClose])

  const handleLogout = async () => {
    await onLogout()
    handleClose()
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
            aria-label="Close account panel"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Account"
            className="glass-panel relative z-10 w-full max-w-xs rounded-lg p-5"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 text-text-muted transition hover:text-text-primary"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono-label text-[10px] uppercase tracking-wider text-accent">
              Admin
            </span>

            <p className="mt-3 break-all font-mono-label text-xs text-text-muted">
              {email}
            </p>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="btn-secondary mt-4"
            >
              Log out
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
