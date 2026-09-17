import { ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart3, Clock, ListMusic, Mic2, Disc3 } from 'lucide-react'
import { listSongsWithRelations } from '../db/library'
import { computeStats } from '../db/stats'
import { EmptyState } from '../components/ui/EmptyState'
import { MiniBarChart } from '../components/music/MiniBarChart'
import { RankedList } from '../components/music/RankedList'
import { formatDuration } from '../lib/format'

export default function Stats() {
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const stats = useLiveQuery(async () => (songs ? computeStats(songs) : undefined), [songs])

  if (stats === undefined) return null

  if (stats.totalPlays === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={28} />}
        title="Aún no hay estadísticas"
        description="Escucha algunas canciones y vuelve aquí para ver tus hábitos de escucha."
      />
    )
  }

  const dailyData = stats.dailyMinutes.map((d) => ({
    label: new Date(d.day).toLocaleDateString('es', { weekday: 'narrow' }),
    value: d.minutes,
  }))

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Estadísticas</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatTile icon={<ListMusic size={18} />} label="Reproducciones" value={stats.totalPlays.toString()} />
        <StatTile icon={<Clock size={18} />} label="Tiempo escuchado" value={formatDuration(stats.totalMsListened)} />
        <StatTile icon={<Mic2 size={18} />} label="Artista top" value={stats.topArtists[0]?.name ?? '—'} />
        <StatTile icon={<Disc3 size={18} />} label="Álbum top" value={stats.topAlbums[0]?.title ?? '—'} />
      </div>

      <div className="card-surface bg-surface p-5 mb-8">
        <h2 className="text-sm font-semibold text-text-muted mb-5">Minutos escuchados · últimos 14 días</h2>
        <MiniBarChart data={dailyData} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card-surface bg-surface p-5">
          <h2 className="text-sm font-semibold text-text-muted mb-4">Canciones más escuchadas</h2>
          <RankedList items={stats.topSongs.map(({ song, plays }) => ({ label: song.title, value: plays }))} />
        </div>
        <div className="card-surface bg-surface p-5">
          <h2 className="text-sm font-semibold text-text-muted mb-4">Artistas más escuchados</h2>
          <RankedList items={stats.topArtists.map((a) => ({ label: a.name, value: a.plays }))} />
        </div>
        <div className="card-surface bg-surface p-5">
          <h2 className="text-sm font-semibold text-text-muted mb-4">Álbumes más escuchados</h2>
          <RankedList items={stats.topAlbums.map((a) => ({ label: a.title, value: a.plays }))} />
        </div>
      </div>
    </div>
  )
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="card-surface bg-surface p-4">
      <div className="w-8 h-8 rounded-md bg-brand-gradient-soft flex items-center justify-center text-accent-400 mb-3">{icon}</div>
      <p className="text-lg font-bold truncate">{value}</p>
      <p className="text-xs text-text-faint">{label}</p>
    </div>
  )
}
