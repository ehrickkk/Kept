interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}
