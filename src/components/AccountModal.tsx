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
            className="glass-panel relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[16px] p-6 sm:p-8"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="tap-target absolute right-3 top-3 text-text-muted transition hover:text-text-primary"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center font-mono-label text-[24px] font-bold uppercase tracking-wider">
                Account Details
              </div>

              <div>
                <p className="mb-3 break-all font-mono-label text-s text-text-muted">
                  Email: {email}
                </p>

                <p className="break-all font-mono-label text-s text-text-muted flex items-center gap-2">
                  Role:<span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono-label text-[10px] uppercase tracking-wider text-accent">
                  Admin</span>
                </p>

              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="mt-12 flex min-h-10 items-center justify-center bg-[#e12b2b] border-0 text-white px-4 py-2 rounded-md hover:bg-[#e12b2b]/80 transition-all duration-200"
              >
                Log out
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
