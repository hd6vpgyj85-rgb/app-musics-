import { ChevronDown, ListMusic } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { CoverImage } from '../ui/CoverImage'
import { IconButton } from '../ui/IconButton'
import { ProgressBar } from './ProgressBar'
import { PlayerControls } from './PlayerControls'
import { VolumeControl } from './VolumeControl'
import { FavoriteButton } from './FavoriteButton'

interface Props {
  open: boolean
  onClose: () => void
  onOpenQueue: () => void
}

export function NowPlayingSheet({ open, onClose, onOpenQueue }: Props) {
  const song = usePlayerStore((s) => s.currentSong)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const seek = usePlayerStore((s) => s.seek)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  if (!open || !song) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg animate-slide-up md:hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <IconButton label="Cerrar" onClick={onClose}>
          <ChevronDown size={22} />
        </IconButton>
        <span className="text-xs font-medium text-text-faint uppercase tracking-wide">Reproduciendo</span>
        <IconButton label="Ver cola" onClick={onOpenQueue}>
          <ListMusic size={19} />
        </IconButton>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <CoverImage
          blob={song.coverBlob ?? song.album?.coverBlob}
          alt={song.title}
          className={`w-full max-w-xs aspect-square shadow-elevated rounded-lg ${isPlaying ? 'animate-pulse-soft' : ''}`}
          rounded="md"
        />

        <div className="w-full mt-8 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{song.title}</h2>
            <p className="text-sm text-text-muted truncate">{song.artist?.name ?? 'Artista desconocido'}</p>
          </div>
          <FavoriteButton songId={song.id} size="lg" />
        </div>
      </div>

      <div className="px-6 pb-10 space-y-6">
        <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} size="lg" />
        <div className="flex justify-center">
          <PlayerControls size="lg" />
        </div>
        <VolumeControl />
      </div>
    </div>
  )
}
