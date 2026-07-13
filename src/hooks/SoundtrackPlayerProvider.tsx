import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { soundtrackKey, type Soundtrack } from '../types'
import {
  SoundtrackPlayerContext,
  type SoundtrackPlayerContextValue,
  type SoundtrackStatus,
} from './soundtrackPlayerContext'

const MUTE_STORAGE_KEY = 'kept-soundtrack-muted'
const FADE_IN_MS = 300
/** Seconds of fade out/in around the loop point so it never cuts abruptly */
const LOOP_FADE_SECONDS = 0.3

function readStoredMute(): boolean {
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function SoundtrackPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeFrameRef = useRef<number | null>(null)
  const loopFrameRef = useRef<number | null>(null)
  const fadingOutForLoopRef = useRef(false)
  const pendingSeekRef = useRef<(() => void) | null>(null)
  const currentRef = useRef<Soundtrack | null>(null)

  const [current, setCurrent] = useState<Soundtrack | null>(null)
  const [status, setStatus] = useState<SoundtrackStatus>('paused')
  const [muted, setMutedState] = useState(readStoredMute)
  const mutedRef = useRef(muted)

  const getAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const el = new Audio()
      el.preload = 'auto'
      el.muted = mutedRef.current
      audioRef.current = el
    }
    return audioRef.current
  }, [])

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current)
      fadeFrameRef.current = null
    }
  }, [])

  const fadeTo = useCallback(
    (target: number, durationMs: number) => {
      const audio = getAudio()
      cancelFade()
      const from = audio.volume
      if (durationMs <= 0 || from === target) {
        audio.volume = target
        return
      }
      const startedAt = performance.now()
      const step = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1)
        audio.volume = from + (target - from) * progress
        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(step)
        } else {
          fadeFrameRef.current = null
        }
      }
      fadeFrameRef.current = requestAnimationFrame(step)
    },
    [getAudio, cancelFade],
  )

  const stopLoopWatch = useCallback(() => {
    if (loopFrameRef.current !== null) {
      cancelAnimationFrame(loopFrameRef.current)
      loopFrameRef.current = null
    }
  }, [])

  const startLoopWatch = useCallback(() => {
    stopLoopWatch()
    const tick = () => {
      const audio = audioRef.current
      const track = currentRef.current
      if (!audio || !track) {
        loopFrameRef.current = null
        return
      }

      const start = track.start_seconds
      const rawEnd = start + track.duration_seconds
      const end =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? Math.min(rawEnd, audio.duration)
          : rawEnd

      if (audio.ended || audio.currentTime >= end - 0.05) {
        audio.currentTime = start
        fadingOutForLoopRef.current = false
        if (audio.paused) {
          void audio.play().catch(() => undefined)
        }
        fadeTo(1, FADE_IN_MS)
      } else if (
        !fadingOutForLoopRef.current &&
        audio.currentTime >= end - LOOP_FADE_SECONDS
      ) {
        fadingOutForLoopRef.current = true
        fadeTo(0, LOOP_FADE_SECONDS * 1000)
      }

      loopFrameRef.current = requestAnimationFrame(tick)
    }
    loopFrameRef.current = requestAnimationFrame(tick)
  }, [stopLoopWatch, fadeTo])

  const stopAll = useCallback(() => {
    cancelFade()
    stopLoopWatch()
    fadingOutForLoopRef.current = false
    const audio = audioRef.current
    if (audio) {
      if (pendingSeekRef.current) {
        audio.removeEventListener('loadedmetadata', pendingSeekRef.current)
        pendingSeekRef.current = null
      }
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    currentRef.current = null
    setCurrent(null)
    setStatus('paused')
  }, [cancelFade, stopLoopWatch])

  const play = useCallback(
    (track: Soundtrack) => {
      const audio = getAudio()

      cancelFade()
      stopLoopWatch()
      fadingOutForLoopRef.current = false
      if (pendingSeekRef.current) {
        audio.removeEventListener('loadedmetadata', pendingSeekRef.current)
        pendingSeekRef.current = null
      }
      audio.pause()

      currentRef.current = track
      setCurrent(track)

      audio.src = track.audio_url
      const seekToStart = () => {
        pendingSeekRef.current = null
        audio.currentTime = track.start_seconds
      }
      pendingSeekRef.current = seekToStart
      audio.addEventListener('loadedmetadata', seekToStart, { once: true })

      audio.volume = 0
      audio.muted = mutedRef.current

      void audio
        .play()
        .then(() => {
          if (currentRef.current !== track) return
          setStatus('playing')
          fadeTo(1, FADE_IN_MS)
          startLoopWatch()
        })
        .catch(() => {
          // Autoplay blocked — leave the pill in a paused state; one tap resumes
          if (currentRef.current !== track) return
          setStatus('paused')
          audio.volume = 1
        })
    },
    [getAudio, cancelFade, stopLoopWatch, fadeTo, startLoopWatch],
  )

  const toggle = useCallback(() => {
    const audio = audioRef.current
    const track = currentRef.current
    if (!audio || !track) return

    if (!audio.paused) {
      cancelFade()
      stopLoopWatch()
      audio.pause()
      setStatus('paused')
      return
    }

    const end = track.start_seconds + track.duration_seconds
    if (
      audio.readyState >= HTMLMediaElement.HAVE_METADATA &&
      (audio.currentTime < track.start_seconds || audio.currentTime >= end)
    ) {
      audio.currentTime = track.start_seconds
    }

    audio.volume = 0
    fadingOutForLoopRef.current = false
    void audio
      .play()
      .then(() => {
        if (currentRef.current !== track) return
        setStatus('playing')
        fadeTo(1, FADE_IN_MS)
        startLoopWatch()
      })
      .catch(() => {
        if (currentRef.current !== track) return
        setStatus('paused')
        audio.volume = 1
      })
  }, [cancelFade, stopLoopWatch, fadeTo, startLoopWatch])

  const stopTrack = useCallback(
    (track: Soundtrack) => {
      const active = currentRef.current
      if (
        !active ||
        soundtrackKey(active.scope, active.scope_key) !==
          soundtrackKey(track.scope, track.scope_key)
      ) {
        return
      }
      stopAll()
    },
    [stopAll],
  )

  const setMuted = useCallback((next: boolean) => {
    mutedRef.current = next
    setMutedState(next)
    if (audioRef.current) {
      audioRef.current.muted = next
    }
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, String(next))
    } catch {
      // localStorage unavailable — mute still applies for this session
    }
  }, [])

  useEffect(() => stopAll, [stopAll])

  const value = useMemo<SoundtrackPlayerContextValue>(
    () => ({ current, status, muted, play, toggle, stopTrack, stopAll, setMuted }),
    [current, status, muted, play, toggle, stopTrack, stopAll, setMuted],
  )

  return (
    <SoundtrackPlayerContext.Provider value={value}>
      {children}
    </SoundtrackPlayerContext.Provider>
  )
}
