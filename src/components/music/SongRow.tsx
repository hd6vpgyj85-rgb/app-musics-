import { Play, Pause, MoreHorizontal, ListPlus, ListEnd, PlusCircle, Pencil, Trash2, XCircle } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { CoverImage } from '../ui/CoverImage'
import { FavoriteButton } from './FavoriteButton'
import { Menu } from '../ui/Menu'
import { formatTime } from '../../lib/format'
import type { SongWithRelations } from '../../types'

interface Props {
  song: SongWithRelations
  queue: SongWithRelations[]
  index: number
  rank?: number
  showAlbum?: boolean
  onAddToPlaylist?: (songId: string) => void
  onEdit?: (song: SongWithRelations) => void
  onDelete?: (song: SongWithRelations) => void
  onRemoveFromPlaylist?: () => void
}

export function SongRow({ song, queue, index, rank, showAlbum, onAddToPlaylist, onEdit, onDelete, onRemoveFromPlaylist }: Props) {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const addNext = usePlayerStore((s) => s.addNext)
  const addToEnd = usePlayerStore((s) => s.addToEnd)

  const isCurrent = currentSong?.id === song.id

  function handlePlay() {
    if (isCurrent) togglePlay()
    else playQueue(queue, index)
  }

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors duration-fast ${
        isCurrent ? 'bg-surface2' : 'hover:bg-surface'
      }`}
    >
      <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
        {rank !== undefined && (
          <span className={`absolute text-xs tabular-nums group-hover:opacity-0 transition-opacity duration-fast ${isCurrent ? 'text-accent-400 opacity-0' : 'text-text-faint'}`}>
            {rank}
          </span>
        )}
        <CoverImage blob={song.coverBlob ?? song.album?.coverBlob} alt={song.title} className="w-9 h-9" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-fast">
          {isCurrent && isPlaying ? <Pause size={14} className="text-white" fill="currentColor" /> : <Play size={14} className="text-white ml-0.5" fill="currentColor" />}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${isCurrent ? 'text-accent-400 font-medium' : 'text-text'}`}>{song.title}</p>
        <p className="text-xs text-text-faint truncate">
          {song.artist?.name ?? 'Artista desconocido'}
          {showAlbum && song.album ? ` · ${song.album.title}` : ''}
        </p>
      </div>

      <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity duration-fast">
        <FavoriteButton songId={song.id} size="sm" />
      </div>

      <span className="text-xs text-text-faint tabular-nums w-10 text-right shrink-0">{formatTime(song.duration)}</span>

      <div onClick={(e) => e.stopPropagation()}>
        <Menu
          trigger={
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-faint hover:text-text hover:bg-surface2 opacity-0 group-hover:opacity-100 transition-all duration-fast" aria-label="Más opciones">
              <MoreHorizontal size={17} />
            </button>
          }
          items={[
            { label: 'Reproducir a continuación', icon: <ListPlus size={15} />, onClick: () => addNext(song) },
            { label: 'Agregar al final de la cola', icon: <ListEnd size={15} />, onClick: () => addToEnd(song) },
            ...(onAddToPlaylist ? [{ label: 'Agregar a playlist', icon: <PlusCircle size={15} />, onClick: () => onAddToPlaylist(song.id) }] : []),
            ...(onEdit ? [{ label: 'Editar canción', icon: <Pencil size={15} />, onClick: () => onEdit(song) }] : []),
            ...(onRemoveFromPlaylist ? [{ label: 'Quitar de esta playlist', icon: <XCircle size={15} />, onClick: onRemoveFromPlaylist, danger: true }] : []),
            ...(onDelete ? [{ label: 'Eliminar de la biblioteca', icon: <Trash2 size={15} />, onClick: () => onDelete(song), danger: true }] : []),
          ]}
        />
      </div>
    </div>
  )
}
