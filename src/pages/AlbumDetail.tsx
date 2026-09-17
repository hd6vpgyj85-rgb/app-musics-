import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Play, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations, deleteAlbum, updateAlbum } from '../db/library'
import { usePlayerStore } from '../store/playerStore'
import { CoverImage } from '../components/ui/CoverImage'
import { Button } from '../components/ui/Button'
import { SongRow } from '../components/music/SongRow'
import { EditSongModal } from '../components/music/EditSongModal'
import { PlaylistPickerModal } from '../components/music/PlaylistPickerModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { formatDuration } from '../lib/format'
import { useToastStore } from '../store/toastStore'
import type { SongWithRelations } from '../types'

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)
  const album = useLiveQuery(() => (id ? db.albums.get(id) : undefined), [id])
  const artist = useLiveQuery(() => (album ? db.artists.get(album.artistId) : undefined), [album])
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const playQueue = usePlayerStore((s) => s.playQueue)

  const [editing, setEditing] = useState<SongWithRelations | null>(null)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
  const [deletingAlbum, setDeletingAlbum] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const albumSongs = useMemo(
    () => (songs ?? []).filter((s) => s.albumId === id).sort((a, b) => (a.trackNumber ?? 999) - (b.trackNumber ?? 999)),
    [songs, id],
  )
  const totalMs = albumSongs.reduce((sum, s) => sum + s.duration * 1000, 0)

  if (!album) return null

  async function handleDeleteAlbum() {
    await deleteAlbum(album!.id, false)
    push('Álbum eliminado. Las canciones se conservaron.', 'success')
    navigate('/albums')
  }

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-5 transition-colors duration-fast">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
        <CoverImage blob={album.coverBlob ?? albumSongs[0]?.coverBlob} alt={album.title} className="w-40 h-40 shrink-0 shadow-elevated" rounded="md" />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-text-faint font-semibold mb-1.5">Álbum</p>
          <h1 className="text-3xl font-bold mb-2 text-balance">{album.title}</h1>
          <p className="text-sm text-text-muted">
            {artist?.name} · {albumSongs.length} canciones · {formatDuration(totalMs)}
            {album.year ? ` · ${album.year}` : ''}
          </p>
          <div className="flex gap-2 mt-4">
            <Button disabled={albumSongs.length === 0} onClick={() => playQueue(albumSongs, 0)}>
              <Play size={16} fill="currentColor" /> Reproducir
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setNewTitle(album.title)
                setRenaming(true)
              }}
            >
              <Pencil size={15} /> Renombrar
            </Button>
            <Button variant="danger" onClick={() => setDeletingAlbum(true)}>
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        {albumSongs.map((song, i) => (
          <SongRow key={song.id} song={song} queue={albumSongs} index={i} rank={i + 1} onAddToPlaylist={setAddingToPlaylist} onEdit={setEditing} />
        ))}
      </div>

      <EditSongModal song={editing} onClose={() => setEditing(null)} />
      <PlaylistPickerModal songId={addingToPlaylist} onClose={() => setAddingToPlaylist(null)} />
      <ConfirmDialog
        open={deletingAlbum}
        title="Eliminar álbum"
        description="El álbum se eliminará pero las canciones se conservarán en tu biblioteca sin álbum asignado."
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeletingAlbum(false)}
      />
      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Renombrar álbum"
        footer={
          <Button
            onClick={async () => {
              await updateAlbum(album!.id, { title: newTitle.trim() || album!.title })
              setRenaming(false)
            }}
          >
            Guardar
          </Button>
        }
      >
        <Input label="Nombre del álbum" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
      </Modal>
    </div>
  )
}
