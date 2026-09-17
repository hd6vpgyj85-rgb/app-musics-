import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { History as HistoryIcon, Trash2 } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations } from '../db/library'
import { usePlayerStore } from '../store/playerStore'
import { CoverImage } from '../components/ui/CoverImage'
import { FavoriteButton } from '../components/music/FavoriteButton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { IconButton } from '../components/ui/IconButton'
import { formatTime, formatRelativeDate } from '../lib/format'
import { useToastStore } from '../store/toastStore'
import type { SongWithRelations } from '../types'

export default function History() {
  const history = useLiveQuery(() => db.playHistory.orderBy('playedAt').reverse().limit(200).toArray(), [])
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const playQueue = usePlayerStore((s) => s.playQueue)
  const push = useToastStore((s) => s.push)
  const [clearing, setClearing] = useState(false)

  const entries = useMemo(() => {
    if (!history || !songs) return undefined
    const map = new Map(songs.map((s) => [s.id, s]))
    return history.map((h) => ({ ...h, song: map.get(h.songId) })).filter((h): h is typeof h & { song: SongWithRelations } => !!h.song)
  }, [history, songs])

  async function handleClear() {
    await db.playHistory.clear()
    push('Historial borrado.', 'success')
    setClearing(false)
  }

  if (entries === undefined) return null

  if (entries.length === 0) {
    return <EmptyState icon={<HistoryIcon size={28} />} title="Sin historial todavía" description="Aquí verás las canciones que has reproducido recientemente." />
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Historial</h1>
        <IconButton label="Borrar historial" onClick={() => setClearing(true)}>
          <Trash2 size={17} />
        </IconButton>
      </div>

      <div className="space-y-0.5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            onClick={() => playQueue([entry.song], 0)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface cursor-pointer transition-colors duration-fast"
          >
            <CoverImage blob={entry.song.coverBlob ?? entry.song.album?.coverBlob} alt={entry.song.title} className="w-10 h-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{entry.song.title}</p>
              <p className="text-xs text-text-faint truncate">{entry.song.artist?.name}</p>
            </div>
            <span className="text-xs text-text-faint tabular-nums hidden sm:block">{formatTime(entry.msPlayed / 1000)} escuchados</span>
            <span className="text-xs text-text-faint w-24 text-right shrink-0">{formatRelativeDate(entry.playedAt)}</span>
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton songId={entry.song.id} size="sm" />
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={clearing}
        title="Borrar historial"
        description="Se eliminará todo tu historial de reproducción. Tus estadísticas de escucha también se reiniciarán."
        confirmLabel="Borrar"
        danger
        onConfirm={handleClear}
        onCancel={() => setClearing(false)}
      />
    </div>
  )
}
