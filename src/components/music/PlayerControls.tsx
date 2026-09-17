import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { IconButton } from '../ui/IconButton'

export function PlayerControls({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const prev = usePlayerStore((s) => s.prev)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const hasSong = usePlayerStore((s) => !!s.currentSong)

  const playSize = size === 'lg' ? 56 : 36
  const iconSize = size === 'lg' ? 24 : 18
  const sideSize = size === 'lg' ? 26 : 19

  return (
    <div className="flex items-center gap-1.5 md:gap-2.5">
      <IconButton label="Aleatorio" active={shuffle} onClick={toggleShuffle} size={size === 'lg' ? 'lg' : 'sm'}>
        <Shuffle size={sideSize - 4} />
      </IconButton>
      <IconButton label="Anterior" onClick={prev} disabled={!hasSong} size={size === 'lg' ? 'lg' : 'sm'}>
        <SkipBack size={sideSize} fill="currentColor" />
      </IconButton>
      <button
        onClick={togglePlay}
        disabled={!hasSong}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        style={{ width: playSize, height: playSize }}
        className="rounded-full bg-white text-bg flex items-center justify-center shadow-soft transition-transform duration-fast active:scale-90 disabled:opacity-30 disabled:pointer-events-none hover:scale-105"
      >
        {isPlaying ? <Pause size={iconSize} fill="currentColor" /> : <Play size={iconSize} fill="currentColor" className="ml-0.5" />}
      </button>
      <IconButton label="Siguiente" onClick={next} disabled={!hasSong} size={size === 'lg' ? 'lg' : 'sm'}>
        <SkipForward size={sideSize} fill="currentColor" />
      </IconButton>
      <IconButton label={`Repetir: ${repeat}`} active={repeat !== 'off'} onClick={cycleRepeat} size={size === 'lg' ? 'lg' : 'sm'}>
        {repeat === 'one' ? <Repeat1 size={sideSize - 4} /> : <Repeat size={sideSize - 4} />}
      </IconButton>
    </div>
  )
}
