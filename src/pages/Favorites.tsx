import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Heart, Shuffle, Play } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations } from '../db/library'
import { usePlayerStore } from '../store/playerStore'
import { SongRow } from '../components/music/SongRow'
import { EditSongModal } from '../components/music/EditSongModal'
import { PlaylistPickerModal } from '../components/music/PlaylistPickerModal'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { SongRowSkeleton } from '../components/ui/Skeleton'
import type { SongWithRelations } from '../types'

export default function Favorites() {
  const favorites = useLiveQuery(() => db.favorites.orderBy('dateAdded').reverse().toArray(), [])
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const playQueue = usePlayerStore((s) => s.playQueue)
  const [editing, setEditing] = useState<SongWithRelations | null>(null)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)

  const favoriteSongs = useMemo(() => {
    if (!favorites || !songs) return undefined
    const map = new Map(songs.map((s) => [s.id, s]))
    return favorites.map((f) => map.get(f.songId)).filter((s): s is SongWithRelations => !!s)
  }, [favorites, songs])

  if (favoriteSongs === undefined) {
    return (
      <div className="space-y-1 max-w-4xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <SongRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (favoriteSongs.length === 0) {
    return <EmptyState icon={<Heart size={28} />} title="Sin favoritas todavía" description="Marca canciones con el corazón para encontrarlas rápido aquí." />
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0 shadow-glow">
          <Heart size={32} className="text-white" fill="currentColor" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-faint font-semibold mb-1">Colección</p>
          <h1 className="text-2xl font-bold mb-3">Canciones favoritas</h1>
          <div className="flex gap-2">
            <Button onClick={() => playQueue(favoriteSongs, 0)}>
              <Play size={15} fill="currentColor" /> Reproducir
            </Button>
            <Button variant="secondary" onClick={() => playQueue([...favoriteSongs].sort(() => Math.random() - 0.5), 0)}>
              <Shuffle size={14} /> Mezclar
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        {favoriteSongs.map((song, i) => (
          <SongRow key={song.id} song={song} queue={favoriteSongs} index={i} showAlbum onAddToPlaylist={setAddingToPlaylist} onEdit={setEditing} />
        ))}
      </div>

      <EditSongModal song={editing} onClose={() => setEditing(null)} />
      <PlaylistPickerModal songId={addingToPlaylist} onClose={() => setAddingToPlaylist(null)} />
    </div>
  )
}
