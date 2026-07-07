import { Plus } from 'lucide-react'

interface AddPhotoButtonProps {
  onClick: () => void
}

export function AddPhotoButton({ onClick }: AddPhotoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add photo"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background transition-opacity hover:opacity-90 md:bottom-8 md:right-8 md:h-14 md:w-14"
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  )
}
