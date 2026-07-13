import { Fragment } from 'react'

export type ViewMode = 'moment' | 'month' | 'year'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

const OPTIONS: { mode: ViewMode; label: string }[] = [
  { mode: 'moment', label: 'By Moment' },
  { mode: 'month', label: 'By Month' },
  { mode: 'year', label: 'By Year' },
]

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {OPTIONS.map((option, index) => (
        <Fragment key={option.mode}>
          {index > 0 && (
            <span className="text-border" aria-hidden="true">
              |
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange(option.mode)}
            className={`flex min-h-10 items-center text-sm transition-colors ${
              mode === option.mode
                ? 'font-medium text-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {option.label}
          </button>
        </Fragment>
      ))}
    </div>
  )
}
