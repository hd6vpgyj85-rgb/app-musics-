import { useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Music2, Upload, ListMusic } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations } from '../db/library'
import { computeStats } from '../db/stats'
import { usePlayerStore } from '../store/playerStore'
import { useAuthStore } from '../store/authStore'
import { EntityCard } from '../components/music/EntityCard'
import { HorizontalSection } from '../components/music/HorizontalSection'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/Skeleton'
import { greeting } from '../lib/format'

export default function Home() {
  const navigate = useNavigate()
  const { openImport } = useOutletContext<{ openImport: () => void }>()
  const user = useAuthStore((s) => s.user)
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const favorites = useLiveQuery(() => db.favorites.orderBy('dateAdded').reverse().toArray(), [])
  const playlists = useLiveQuery(() => db.playlists.orderBy('dateModified').reverse().toArray(), [])
  const stats = useLiveQuery(async () => computeStats(songs ?? []), [songs])
  const playQueue = usePlayerStore((s) => s.playQueue)

  const favoriteSongs = useMemo(() => {
    if (!songs || !favorites) return []
    const map = new Map(songs.map((s) => [s.id, s]))
    return favorites.map((f) => map.get(f.songId)).filter((s): s is NonNullable<typeof s> => !!s)
  }, [songs, favorites])

  const recentlyAdded = useMemo(() => (songs ? [...songs].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 10) : []), [songs])

  if (songs === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <div className="pt-8">
        <h1 className="text-2xl font-bold mb-6">
          {greeting()}, {user?.username}
        </h1>
        <EmptyState
          icon={<Music2 size={28} />}
          title="Empecemos tu biblioteca"
          description="Importa tus canciones favoritas en MP3, WAV, M4A o FLAC. Se guardan localmente en este dispositivo y funcionan sin conexión."
          action={
            <Button onClick={openImport} size="lg">
              <Upload size={17} /> Importar música
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-7">
        {greeting()}, {user?.username}
      </h1>

      {stats && stats.recentlyPlayed.length > 0 && (
        <HorizontalSection title="Escuchado recientemente">
          {stats.recentlyPlayed.map((song) => (
            <div key={song.id} className="w-36 shrink-0">
              <EntityCard cover={song.coverBlob ?? song.album?.coverBlob} title={song.title} subtitle={song.artist?.name} onClick={() => playQueue([song], 0)} onPlay={() => playQueue([song], 0)} />
            </div>
          ))}
        </HorizontalSection>
      )}

      {favoriteSongs.length > 0 && (
        <HorizontalSection title="Tus canciones favoritas" action={<button onClick={() => navigate('/favorites')} className="text-xs text-text-faint hover:text-text">Ver todas</button>}>
          {favoriteSongs.slice(0, 10).map((song) => (
            <div key={song.id} className="w-36 shrink-0">
              <EntityCard cover={song.coverBlob ?? song.album?.coverBlob} title={song.title} subtitle={song.artist?.name} onClick={() => playQueue(favoriteSongs, favoriteSongs.indexOf(song))} onPlay={() => playQueue(favoriteSongs, favoriteSongs.indexOf(song))} />
            </div>
          ))}
        </HorizontalSection>
      )}

      {stats && stats.topSongs.length > 0 && (
        <HorizontalSection title="Más escuchadas" action={<button onClick={() => navigate('/stats')} className="text-xs text-text-faint hover:text-text">Ver estadísticas</button>}>
          {stats.topSongs.slice(0, 10).map(({ song }) => (
            <div key={song.id} className="w-36 shrink-0">
              <EntityCard cover={song.coverBlob ?? song.album?.coverBlob} title={song.title} subtitle={song.artist?.name} onClick={() => playQueue([song], 0)} onPlay={() => playQueue([song], 0)} />
            </div>
          ))}
        </HorizontalSection>
      )}

      <HorizontalSection title="Agregadas recientemente">
        {recentlyAdded.map((song) => (
          <div key={song.id} className="w-36 shrink-0">
            <EntityCard cover={song.coverBlob ?? song.album?.coverBlob} title={song.title} subtitle={song.artist?.name} onClick={() => playQueue(recentlyAdded, recentlyAdded.indexOf(song))} onPlay={() => playQueue(recentlyAdded, recentlyAdded.indexOf(song))} />
          </div>
        ))}
      </HorizontalSection>

      {playlists && playlists.length > 0 && (
        <HorizontalSection title="Tus playlists">
          {playlists.map((p) => (
            <div key={p.id} className="w-36 shrink-0">
              <EntityCard cover={p.coverBlob} title={p.name} subtitle="Playlist" onClick={() => navigate(`/playlists/${p.id}`)} />
            </div>
          ))}
        </HorizontalSection>
      )}

      {playlists && playlists.length === 0 && (
        <div className="card-surface bg-surface p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-brand-gradient-soft flex items-center justify-center text-accent-400">
              <ListMusic size={20} />
            </div>
            <div>
              <p className="font-medium text-sm">Crea tu primera playlist</p>
              <p className="text-xs text-text-faint">Organiza tu música como quieras</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/playlists')}>
            Crear playlist
          </Button>
        </div>
      )}
    </div>
  )
}
