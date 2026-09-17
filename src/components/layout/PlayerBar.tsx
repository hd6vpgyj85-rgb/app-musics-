import { useState } from 'react'
import { ListMusic } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { CoverImage } from '../ui/CoverImage'
import { IconButton } from '../ui/IconButton'
import { ProgressBar } from '../music/ProgressBar'
import { PlayerControls } from '../music/PlayerControls'
import { VolumeControl } from '../music/VolumeControl'
import { FavoriteButton } from '../music/FavoriteButton'
import { QueuePanel } from '../music/QueuePanel'
import { NowPlayingSheet } from '../music/NowPlayingSheet'

export function PlayerBar() {
  const song = usePlayerStore((s) => s.currentSong)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const seek = usePlayerStore((s) => s.seek)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const [queueOpen, setQueueOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!song) return null

  return (
    <>
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 border-t border-border bg-elevated/95 backdrop-blur">
        <div
          className="md:hidden flex items-center gap-3 px-3 py-2 cursor-pointer animate-fade-in"
          onClick={() => setSheetOpen(true)}
        >
          <CoverImage blob={song.coverBlob ?? song.album?.coverBlob} alt={song.title} className="w-10 h-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{song.title}</p>
            <p className="text-xs text-text-faint truncate">{song.artist?.name}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className="w-9 h-9 rounded-full bg-white text-bg flex items-center justify-center shrink-0"
          >
            {isPlaying ? (
              <div className="w-2.5 h-2.5 flex gap-0.5">
                <span className="w-1 h-2.5 bg-bg inline-block" />
                <span className="w-1 h-2.5 bg-bg inline-block" />
              </div>
            ) : (
              <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[9px] border-l-bg ml-0.5" />
            )}
          </button>
        </div>

        <div className="hidden md:grid grid-cols-3 items-center gap-4 px-5 py-3 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <CoverImage blob={song.coverBlob ?? song.album?.coverBlob} alt={song.title} className={`w-14 h-14 shrink-0 ${isPlaying ? 'animate-pulse-soft' : ''}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{song.title}</p>
              <p className="text-xs text-text-faint truncate">{song.artist?.name ?? 'Artista desconocido'}</p>
            </div>
            <FavoriteButton songId={song.id} />
          </div>

          <div className="flex flex-col items-center gap-1.5 w-full max-w-lg mx-auto">
            <PlayerControls />
            <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
          </div>

          <div className="flex items-center justify-end gap-3">
            <VolumeControl />
            <IconButton label="Ver cola" onClick={() => setQueueOpen(true)}>
              <ListMusic size={18} />
            </IconButton>
          </div>
        </div>
      </div>

      <NowPlayingSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onOpenQueue={() => setQueueOpen(true)} />
      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
    </>
  )
}
