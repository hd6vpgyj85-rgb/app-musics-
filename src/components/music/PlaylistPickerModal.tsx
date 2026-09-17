import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, ListMusic, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { db } from '../../db/db'
import { addSongToPlaylist, createPlaylist } from '../../db/playlists'
import { useToastStore } from '../../store/toastStore'

export function PlaylistPickerModal({ songId, onClose }: { songId: string | null; onClose: () => void }) {
  const playlists = useLiveQuery(() => db.playlists.orderBy('dateModified').reverse().toArray(), []) ?? []
  const [newName, setNewName] = useState('')
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set())
  const push = useToastStore((s) => s.push)

  if (!songId) return null

  async function handleAdd(playlistId: string) {
    await addSongToPlaylist(playlistId, songId!)
    setAddedTo((prev) => new Set(prev).add(playlistId))
    push('Agregada a la playlist.', 'success')
  }

  async function handleCreateAndAdd() {
    if (!newName.trim()) return
    const playlist = await createPlaylist(newName)
    await handleAdd(playlist.id)
    setNewName('')
  }

  return (
    <Modal open={!!songId} onClose={onClose} title="Agregar a playlist">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleCreateAndAdd()
        }}
        className="flex gap-2 mb-4"
      >
        <Input placeholder="Nueva playlist..." value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
        <button type="submit" className="btn bg-surface2 border border-border w-10 h-10 shrink-0" aria-label="Crear playlist">
          <Plus size={16} />
        </button>
      </form>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {playlists.length === 0 && <p className="text-sm text-text-faint text-center py-4">Aún no tienes playlists.</p>}
        {playlists.map((p) => {
          const added = addedTo.has(p.id)
          return (
            <button
              key={p.id}
              onClick={() => handleAdd(p.id)}
              disabled={added}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface2 text-left disabled:opacity-60"
            >
              <ListMusic size={16} className="text-text-faint" />
              <span className="flex-1 text-sm truncate">{p.name}</span>
              {added && <Check size={16} className="text-accent-400" />}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
