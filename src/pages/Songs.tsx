import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchParams } from 'react-router-dom'
import { Music2, ArrowDownAZ, Clock, SlidersHorizontal } from 'lucide-react'
import { listSongsWithRelations, deleteSong } from '../db/library'
import { SongRow } from '../components/music/SongRow'
import { EditSongModal } from '../components/music/EditSongModal'
import { PlaylistPickerModal } from '../components/music/PlaylistPickerModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { SongRowSkeleton } from '../components/ui/Skeleton'
import { Input } from '../components/ui/Input'
import { useToastStore } from '../store/toastStore'
import type { SongWithRelations } from '../types'

type SortKey = 'recent' | 'title' | 'artist'

export default function Songs() {
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [editing, setEditing] = useState<SongWithRelations | null>(null)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<SongWithRelations | null>(null)
  const [searchParams] = useSearchParams()
  const push = useToastStore((s) => s.push)

  const filtered = useMemo(() => {
    if (!songs) return []
    let list = songs
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((s) => s.title.toLowerCase().includes(q) || s.artist?.name.toLowerCase().includes(q))
    list = [...list]
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'artist') list.sort((a, b) => (a.artist?.name ?? '').localeCompare(b.artist?.name ?? ''))
    else list.sort((a, b) => b.dateAdded - a.dateAdded)
    return list
  }, [songs, query, sort])

  useEffect(() => {
    const highlight = searchParams.get('highlight')
    if (!highlight) return
    const el = document.getElementById(`song-${highlight}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-accent-500')
      setTimeout(() => el.classList.remove('ring-2', 'ring-accent-500'), 1600)
    }
  }, [searchParams, filtered])

  async function handleDelete() {
    if (!deleting) return
    await deleteSong(deleting.id)
    push('Canción eliminada.', 'success')
    setDeleting(null)
  }

  if (songs === undefined) {
    return (
      <div className="space-y-1 max-w-4xl">
        {Array.from({ length: 8 }).map((_, i) => (
          <SongRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <EmptyState
        icon={<Music2 size={28} />}
        title="Tu biblioteca está vacía"
        description="Importa tus archivos MP3, WAV, M4A o FLAC para empezar a construir tu colección musical."
      />
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold">Canciones</h1>
        <span className="text-sm text-text-faint">{songs.length} en total</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input placeholder="Filtrar canciones..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
        <div className="flex gap-1.5 bg-surface border border-border rounded-full p-1 w-fit">
          <SortButton active={sort === 'recent'} onClick={() => setSort('recent')} icon={<SlidersHorizontal size={13} />} label="Recientes" />
          <SortButton active={sort === 'title'} onClick={() => setSort('title')} icon={<ArrowDownAZ size={13} />} label="Título" />
          <SortButton active={sort === 'artist'} onClick={() => setSort('artist')} icon={<Clock size={13} />} label="Artista" />
        </div>
      </div>

      <div className="space-y-0.5">
        {filtered.map((song, i) => (
          <div key={song.id} id={`song-${song.id}`} className="rounded-md transition-shadow duration-base">
            <SongRow
              song={song}
              queue={filtered}
              index={i}
              onAddToPlaylist={setAddingToPlaylist}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          </div>
        ))}
      </div>

      <EditSongModal song={editing} onClose={() => setEditing(null)} />
      <PlaylistPickerModal songId={addingToPlaylist} onClose={() => setAddingToPlaylist(null)} />
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar canción"
        description={`"${deleting?.title}" se eliminará de tu biblioteca, playlists e historial. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

function SortButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-fast ${
        active ? 'bg-brand-gradient text-white' : 'text-text-muted hover:text-text'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
