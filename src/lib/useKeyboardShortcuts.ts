import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA'])

export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (TYPING_TAGS.has(target.tagName) || target.isContentEditable) return

      const { togglePlay, next, prev, seek, currentTime, duration, toggleMute, currentSong } = usePlayerStore.getState()
      if (!currentSong) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          if (e.shiftKey) next()
          else seek(Math.min(duration, currentTime + 5))
          break
        case 'ArrowLeft':
          if (e.shiftKey) prev()
          else seek(Math.max(0, currentTime - 5))
          break
        case 'm':
        case 'M':
          toggleMute()
          break
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
