import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Mic2 } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations } from '../db/library'
import { usePlayerStore } from '../store/playerStore'
import { EntityCard } from '../components/music/EntityCard'
import { EmptyState } from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'

export default function Artists() {
  const artists = useLiveQuery(() => db.artists.toArray(), [])
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const navigate = useNavigate()
  const playQueue = usePlayerStore((s) => s.playQueue)

  const songsByArtist = useMemo(() => {
    const map = new Map<string, typeof songs>()
    for (const s of songs ?? []) {
      if (!map.has(s.artistId)) map.set(s.artistId, [])
      map.get(s.artistId)!.push(s)
    }
    return map
  }, [songs])

  if (artists === undefined || songs === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (artists.length === 0) {
    return <EmptyState icon={<Mic2 size={28} />} title="Sin artistas todavía" description="Los artistas aparecerán aquí automáticamente al importar tu música." />
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Artistas</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {artists.map((artist) => {
          const artistSongs = songsByArtist.get(artist.id) ?? []
          return (
            <EntityCard
              key={artist.id}
              cover={artist.imageBlob ?? artistSongs[0]?.coverBlob}
              title={artist.name}
              subtitle={`${artistSongs.length} canción${artistSongs.length === 1 ? '' : 'es'}`}
              rounded="full"
              onClick={() => navigate(`/artists/${artist.id}`)}
              onPlay={artistSongs.length ? () => playQueue(artistSongs, 0) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
