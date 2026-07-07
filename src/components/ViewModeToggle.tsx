export type ViewMode = 'moment' | 'month'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={() => onChange('moment')}
        className={`text-sm transition-colors ${
          mode === 'moment'
            ? 'font-medium text-accent'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        By Moment
      </button>
      <span className="text-border" aria-hidden="true">|</span>
      <button
        type="button"
        onClick={() => onChange('month')}
        className={`text-sm transition-colors ${
          mode === 'month'
            ? 'font-medium text-accent'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        By Month
      </button>
    </div>
  )
}
