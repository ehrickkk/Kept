import { useNavigate } from 'react-router-dom'
import { formatFrameDate } from '../lib/utils'
import type { PhotoEntry } from '../types'

interface FilmstripPreviewProps {
  photos: PhotoEntry[]
}

const FILMSTRIP_COUNT = 6

export function FilmstripPreview({ photos }: FilmstripPreviewProps) {
  const navigate = useNavigate()

  if (photos.length === 0) return null

  const frames = photos.slice(0, FILMSTRIP_COUNT)
  const loopFrames = [...frames, ...frames]

  const handleNavigate = () => {
    navigate('/home')
  }

  return (
    <section
      className="filmstrip-mask w-full overflow-hidden py-10 sm:py-14"
      aria-label="Recent photo preview"
    >
      <div className="filmstrip-track flex w-max gap-3 px-4 sm:gap-4 sm:px-6">
        {loopFrames.map((photo, index) => (
          <button
            key={`${photo.id}-${index}`}
            type="button"
            onClick={handleNavigate}
            className="group shrink-0 cursor-pointer bg-transparent text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            aria-label={`View archive — ${formatFrameDate(photo.date)}`}
          >
            <div className="w-24 rounded border border-border bg-surface p-1 transition-colors group-hover:border-accent/60 sm:w-32 md:w-36">
              <div className="aspect-4/5 overflow-hidden bg-background">
                <img
                  src={photo.image_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <p className="mt-1.5 text-center font-mono-label text-[9px] tracking-wide text-text-muted sm:text-[10px]">
              {formatFrameDate(photo.date)}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
