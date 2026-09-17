import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Play, ArrowLeft, Pencil, Trash2, ImagePlus } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations, deleteArtist, updateArtist } from '../db/library'
import { usePlayerStore } from '../store/playerStore'
import { CoverImage } from '../components/ui/CoverImage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SongRow } from '../components/music/SongRow'
import { EntityCard } from '../components/music/EntityCard'
import { EditSongModal } from '../components/music/EditSongModal'
import { PlaylistPickerModal } from '../components/music/PlaylistPickerModal'
import { useToastStore } from '../store/toastStore'
import type { SongWithRelations } from '../types'

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)
  const artist = useLiveQuery(() => (id ? db.artists.get(id) : undefined), [id])
  const albums = useLiveQuery(() => (id ? db.albums.where('artistId').equals(id).toArray() : []), [id]) ?? []
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const playQueue = usePlayerStore((s) => s.playQueue)

  const [editing, setEditing] = useState<SongWithRelations | null>(null)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [deletingArtist, setDeletingArtist] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const artistSongs = useMemo(() => (songs ?? []).filter((s) => s.artistId === id), [songs, id])

  if (!artist) return null

  async function handleDelete() {
    await deleteArtist(artist!.id, false)
    push('Artista eliminado. Sus canciones pasaron a "Artista desconocido".', 'success')
    navigate('/artists')
  }

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-5 transition-colors duration-fast">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
        <div className="relative shrink-0">
          <CoverImage blob={artist.imageBlob ?? artistSongs[0]?.coverBlob} alt={artist.name} className="w-40 h-40 shadow-elevated" rounded="full" />
          <button
            onClick={() => imageInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-soft"
            aria-label="Cambiar imagen del artista"
          >
            <ImagePlus size={15} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) await updateArtist(artist.id, { imageBlob: f })
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-text-faint font-semibold mb-1.5">Artista</p>
          <h1 className="text-3xl font-bold mb-2 text-balance">{artist.name}</h1>
          <p className="text-sm text-text-muted">
            {artistSongs.length} canciones · {albums.length} álbumes
          </p>
          <div className="flex gap-2 mt-4">
            <Button disabled={artistSongs.length === 0} onClick={() => playQueue(artistSongs, 0)}>
              <Play size={16} fill="currentColor" /> Reproducir
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setNewName(artist.name)
                setRenaming(true)
              }}
            >
              <Pencil size={15} /> Renombrar
            </Button>
            <Button variant="danger" onClick={() => setDeletingArtist(true)}>
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      </div>

      {albums.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Álbumes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {albums.map((album) => (
              <EntityCard
                key={album.id}
                cover={album.coverBlob}
                title={album.title}
                subtitle={album.year?.toString()}
                onClick={() => navigate(`/albums/${album.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Canciones</h2>
      <div className="space-y-0.5">
        {artistSongs.map((song, i) => (
          <SongRow key={song.id} song={song} queue={artistSongs} index={i} showAlbum onAddToPlaylist={setAddingToPlaylist} onEdit={setEditing} />
        ))}
      </div>

      <EditSongModal song={editing} onClose={() => setEditing(null)} />
      <PlaylistPickerModal songId={addingToPlaylist} onClose={() => setAddingToPlaylist(null)} />
      <ConfirmDialog
        open={deletingArtist}
        title="Eliminar artista"
        description="El artista se eliminará. Sus canciones y álbumes pasarán a 'Artista desconocido' en lugar de borrarse."
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingArtist(false)}
      />
      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Renombrar artista"
        footer={
          <Button
            onClick={async () => {
              await updateArtist(artist!.id, { name: newName.trim() || artist!.name })
              setRenaming(false)
            }}
          >
            Guardar
          </Button>
        }
      >
        <Input label="Nombre del artista" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
      </Modal>
    </div>
  )
}
