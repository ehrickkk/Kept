import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

interface SmartImageProps {
  src: string
  alt: string
  /**
   * Reserved ratio (CSS aspect-ratio value, e.g. "4 / 5").
   * Ignored when `fill` is set.
   */
  aspectRatio?: string
  /**
   * Fill the nearest positioned parent (parent reserves the space itself).
   */
  fill?: boolean
  /**
   * Masonry mode: adopt the image's natural ratio once it loads.
   * Until then the tile is reserved at `aspectRatio` (default 4 / 5).
   */
  naturalRatio?: boolean
  /** Extra classes for the <img> element (e.g. rounding, blur, final opacity) */
  className?: string
  /** Extra classes for the wrapper element */
  containerClassName?: string
  /** Show the solid surface-colored placeholder behind the image (default true) */
  placeholder?: boolean
  eager?: boolean
  onLoaded?: () => void
}

export function SmartImage({
  src,
  alt,
  aspectRatio,
  fill = false,
  naturalRatio = false,
  className = '',
  containerClassName = '',
  placeholder = true,
  eager = false,
  onLoaded,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [measuredRatio, setMeasuredRatio] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const notifiedRef = useRef(false)

  const markLoaded = useCallback(() => {
    const img = imgRef.current
    if (naturalRatio && img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setMeasuredRatio(`${img.naturalWidth} / ${img.naturalHeight}`)
    }
    setLoaded(true)
    if (!notifiedRef.current) {
      notifiedRef.current = true
      onLoaded?.()
    }
  }, [naturalRatio, onLoaded])

  // Cached images can be complete before onLoad is attached
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) markLoaded()
  }, [markLoaded, src])

  const containerStyle: CSSProperties | undefined = fill
    ? undefined
    : {
        aspectRatio: naturalRatio
          ? (measuredRatio ?? aspectRatio ?? '4 / 5')
          : aspectRatio,
      }

  return (
    <div
      className={`${fill ? 'absolute inset-0' : 'relative'} overflow-hidden ${
        placeholder ? 'bg-surface' : ''
      } ${containerClassName}`}
      style={containerStyle}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={markLoaded}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-350 ease-out ${className}`}
        style={loaded ? undefined : { opacity: 0 }}
      />
    </div>
  )
}
