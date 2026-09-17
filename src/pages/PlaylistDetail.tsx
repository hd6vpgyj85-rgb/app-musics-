import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Play, Shuffle, ArrowLeft, ImagePlus, Plus, GripVertical } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations } from '../db/library'
import { addSongToPlaylist, removeSongFromPlaylist, reorderPlaylistSongs, updatePlaylist } from '../db/playlists'
import { usePlayerStore } from '../store/playerStore'
import { CoverImage } from '../components/ui/CoverImage'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { SongRow } from '../components/music/SongRow'
import { EditSongModal } from '../components/music/EditSongModal'
import { PlaylistPickerModal } from '../components/music/PlaylistPickerModal'
import { formatDuration } from '../lib/format'
import { useToastStore } from '../store/toastStore'
import type { SongWithRelations } from '../types'

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)
  const playlist = useLiveQuery(() => (id ? db.playlists.get(id) : undefined), [id])
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const playlistSongsRaw = useLiveQuery(() => (id ? db.playlistSongs.where('playlistId').equals(id).toArray() : []), [id])
  const playQueue = usePlayerStore((s) => s.playQueue)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState<SongWithRelations | null>(null)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
  const [addSongsOpen, setAddSongsOpen] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const entries = useMemo(() => {
    if (!songs || !playlistSongsRaw) return []
    const songMap = new Map(songs.map((s) => [s.id, s]))
    return [...playlistSongsRaw]
      .sort((a, b) => a.position - b.position)
      .map((ps) => ({ playlistSongId: ps.id, song: songMap.get(ps.songId) }))
      .filter((e): e is { playlistSongId: string; song: SongWithRelations } => !!e.song)
  }, [songs, playlistSongsRaw])

  const queue = useMemo(() => entries.map((e) => e.song), [entries])
  const totalMs = queue.reduce((sum, s) => sum + s.duration * 1000, 0)
  const availableSongs = useMemo(() => (songs ?? []).filter((s) => !entries.some((e) => e.song.id === s.id)), [songs, entries])

  if (!playlist) return null

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return
    const reordered = [...entries]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    void reorderPlaylistSongs(playlist!.id, reordered.map((e) => e.playlistSongId))
    setDragIndex(null)
  }

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-5 transition-colors duration-fast">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
        <div className="relative shrink-0">
          <CoverImage blob={playlist.coverBlob ?? queue[0]?.coverBlob} alt={playlist.name} className="w-40 h-40 shadow-elevated" rounded="md" />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-soft"
            aria-label="Cambiar portada"
          >
            <ImagePlus size={15} />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) await updatePlaylist(playlist.id, { coverBlob: f })
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-text-faint font-semibold mb-1.5">Playlist</p>
          <h1 className="text-3xl font-bold mb-2 text-balance">{playlist.name}</h1>
          <p className="text-sm text-text-muted">
            {queue.length} canciones{queue.length > 0 ? ` · ${formatDuration(totalMs)}` : ''}
          </p>
          <div className="flex gap-2 mt-4">
            <Button disabled={queue.length === 0} onClick={() => playQueue(queue, 0)}>
              <Play size={16} fill="currentColor" /> Reproducir
            </Button>
            <Button
              variant="secondary"
              disabled={queue.length === 0}
              onClick={() => {
                const shuffled = [...queue].sort(() => Math.random() - 0.5)
                playQueue(shuffled, 0)
              }}
            >
              <Shuffle size={15} /> Mezclar
            </Button>
            <Button variant="secondary" onClick={() => setAddSongsOpen(true)}>
              <Plus size={15} /> Agregar canciones
            </Button>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Plus size={26} />}
          title="Playlist vacía"
          description="Agrega canciones desde tu biblioteca para empezar a armar esta playlist."
          action={
            <Button onClick={() => setAddSongsOpen(true)}>
              <Plus size={16} /> Agregar canciones
            </Button>
          }
        />
      ) : (
        <div className="space-y-0.5">
          {entries.map((entry, i) => (
            <div
              key={entry.playlistSongId}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="flex items-center gap-1 group/drag"
            >
              <GripVertical size={14} className="text-text-faint opacity-0 group-hover/drag:opacity-100 cursor-grab shrink-0 transition-opacity duration-fast" />
              <div className="flex-1 min-w-0">
                <SongRow
                  song={entry.song}
                  queue={queue}
                  index={i}
                  rank={i + 1}
                  showAlbum
                  onAddToPlaylist={setAddingToPlaylist}
                  onEdit={setEditing}
                  onRemoveFromPlaylist={() => removeSongFromPlaylist(entry.playlistSongId, playlist!.id).then(() => push('Canción quitada de la playlist.', 'info'))}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <EditSongModal song={editing} onClose={() => setEditing(null)} />
      <PlaylistPickerModal songId={addingToPlaylist} onClose={() => setAddingToPlaylist(null)} />

      <Modal open={addSongsOpen} onClose={() => setAddSongsOpen(false)} title="Agregar canciones" maxWidth="max-w-lg">
        {availableSongs.length === 0 ? (
          <p className="text-sm text-text-faint text-center py-6">Ya agregaste todas tus canciones a esta playlist.</p>
        ) : (
          <div className="space-y-0.5 max-h-[55vh] overflow-y-auto">
            {availableSongs.map((song) => (
              <button
                key={song.id}
                onClick={async () => {
                  await addSongToPlaylist(playlist!.id, song.id)
                  push(`"${song.title}" agregada.`, 'success')
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-surface text-left"
              >
                <CoverImage blob={song.coverBlob ?? song.album?.coverBlob} alt={song.title} className="w-9 h-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{song.title}</p>
                  <p className="text-xs text-text-faint truncate">{song.artist?.name}</p>
                </div>
                <Plus size={16} className="text-text-faint shrink-0" />
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
