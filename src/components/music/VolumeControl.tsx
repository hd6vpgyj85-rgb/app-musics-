import { Volume2, Volume1, VolumeX } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { IconButton } from '../ui/IconButton'

export function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)

  const Icon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="flex items-center gap-2 w-32">
      <IconButton label={muted ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute} size="sm">
        <Icon size={17} />
      </IconButton>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="volume-slider w-full"
        style={{ ['--fill' as string]: `${(muted ? 0 : volume) * 100}%` }}
        aria-label="Volumen"
      />
    </div>
  )
}
