import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const DEFAULT_TYPE_MS = 55
const DEFAULT_DELETE_MS = 35
const DEFAULT_PAUSE_MS = 2000

export function useTypewriter(
  phrases: readonly string[],
  options?: {
    typeMs?: number
    deleteMs?: number
    pauseMs?: number
  },
): string {
  const prefersReducedMotion = usePrefersReducedMotion()
  const typeMs = options?.typeMs ?? DEFAULT_TYPE_MS
  const deleteMs = options?.deleteMs ?? DEFAULT_DELETE_MS
  const pauseMs = options?.pauseMs ?? DEFAULT_PAUSE_MS

  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentPhrase = phrases[phraseIndex] ?? ''

  useEffect(() => {
    if (prefersReducedMotion || phrases.length === 0) return

    const isComplete = !isDeleting && charIndex === currentPhrase.length
    const isEmpty = isDeleting && charIndex === 0

    let delay = isDeleting ? deleteMs : typeMs
    if (isComplete) delay = pauseMs
    if (isEmpty) delay = pauseMs

    const timer = window.setTimeout(() => {
      if (isComplete) {
        setIsDeleting(true)
        return
      }

      if (isEmpty) {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
        return
      }

      setCharIndex((prev) => prev + (isDeleting ? -1 : 1))
    }, delay)

    return () => window.clearTimeout(timer)
  }, [
    charIndex,
    currentPhrase.length,
    deleteMs,
    isDeleting,
    pauseMs,
    phrases.length,
    prefersReducedMotion,
    typeMs,
  ])

  if (prefersReducedMotion || phrases.length === 0) {
    return phrases[0] ?? ''
  }

  return currentPhrase.slice(0, charIndex)
}
