interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="mx-auto max-w-md rounded border border-red-900/50 bg-red-950/30 px-4 py-3 text-center">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm text-red-400 underline hover:text-red-300"
        >
          Try again
        </button>
      )}
    </div>
  )
}
