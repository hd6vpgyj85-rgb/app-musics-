import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ListMusic, Plus, Pencil, Trash2 } from 'lucide-react'
import { db } from '../db/db'
import { createPlaylist, deletePlaylist, updatePlaylist } from '../db/playlists'
import { listSongsWithRelations } from '../db/library'
import { usePlayerStore } from '../store/playerStore'
import { EntityCard } from '../components/music/EntityCard'
import { EmptyState } from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Menu } from '../components/ui/Menu'
import { useToastStore } from '../store/toastStore'
import type { Playlist } from '../types'

export default function Playlists() {
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)
  const playlists = useLiveQuery(() => db.playlists.orderBy('dateModified').reverse().toArray(), [])
  const playlistSongs = useLiveQuery(() => db.playlistSongs.toArray(), [])
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const playQueue = usePlayerStore((s) => s.playQueue)

  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [renaming, setRenaming] = useState<Playlist | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleting, setDeleting] = useState<Playlist | null>(null)

  async function handleCreate() {
    if (!name.trim()) return
    const playlist = await createPlaylist(name)
    setCreating(false)
    setName('')
    navigate(`/playlists/${playlist.id}`)
  }

  async function handleDelete() {
    if (!deleting) return
    await deletePlaylist(deleting.id)
    push('Playlist eliminada.', 'success')
    setDeleting(null)
  }

  function songsFor(playlistId: string) {
    if (!playlistSongs || !songs) return []
    const songMap = new Map(songs.map((s) => [s.id, s]))
    return playlistSongs
      .filter((ps) => ps.playlistId === playlistId)
      .sort((a, b) => a.position - b.position)
      .map((ps) => songMap.get(ps.songId))
      .filter((s): s is NonNullable<typeof s> => !!s)
  }

  if (playlists === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> Nueva playlist
        </Button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          icon={<ListMusic size={28} />}
          title="Crea tu primera playlist"
          description="Organiza tus canciones favoritas en colecciones a tu gusto."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} /> Nueva playlist
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {playlists.map((p) => {
            const items = songsFor(p.id)
            return (
              <EntityCard
                key={p.id}
                cover={p.coverBlob ?? items[0]?.coverBlob}
                title={p.name}
                subtitle={`${items.length} canción${items.length === 1 ? '' : 'es'}`}
                onClick={() => navigate(`/playlists/${p.id}`)}
                onPlay={items.length ? () => playQueue(items, 0) : undefined}
                menu={
                  <Menu
                    trigger={
                      <button className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center" aria-label="Más opciones">
                        <Pencil size={13} />
                      </button>
                    }
                    items={[
                      {
                        label: 'Renombrar',
                        icon: <Pencil size={15} />,
                        onClick: () => {
                          setRenaming(p)
                          setRenameValue(p.name)
                        },
                      },
                      { label: 'Eliminar playlist', icon: <Trash2 size={15} />, onClick: () => setDeleting(p), danger: true },
                    ]}
                  />
                }
              />
            )
          })}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nueva playlist"
        footer={<Button onClick={handleCreate}>Crear</Button>}
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleCreate() }}>
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi playlist" autoFocus />
        </form>
      </Modal>

      <Modal
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Renombrar playlist"
        footer={
          <Button
            onClick={async () => {
              if (renaming) await updatePlaylist(renaming.id, { name: renameValue.trim() || renaming.name })
              setRenaming(null)
            }}
          >
            Guardar
          </Button>
        }
      >
        <Input label="Nombre" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar playlist"
        description={`"${deleting?.name}" se eliminará. Las canciones no se verán afectadas.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
