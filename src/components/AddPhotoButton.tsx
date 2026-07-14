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
      className="fixed z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background transition-opacity hover:opacity-90 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] md:right-[max(2rem,env(safe-area-inset-right))] md:h-14 md:w-14 lg:bottom-[calc(2rem+env(safe-area-inset-bottom))]"
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  )
}
