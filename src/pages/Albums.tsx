import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Disc3 } from 'lucide-react'
import { db } from '../db/db'
import { listSongsWithRelations } from '../db/library'
import { usePlayerStore } from '../store/playerStore'
import { EntityCard } from '../components/music/EntityCard'
import { EmptyState } from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'

export default function Albums() {
  const albums = useLiveQuery(() => db.albums.toArray(), [])
  const artists = useLiveQuery(() => db.artists.toArray(), [])
  const songs = useLiveQuery(() => listSongsWithRelations(), [])
  const navigate = useNavigate()
  const playQueue = usePlayerStore((s) => s.playQueue)

  const artistMap = useMemo(() => new Map((artists ?? []).map((a) => [a.id, a.name])), [artists])

  if (albums === undefined || songs === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (albums.length === 0) {
    return <EmptyState icon={<Disc3 size={28} />} title="Sin álbumes todavía" description="Los álbumes se crean automáticamente al importar canciones con esa información." />
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Álbumes</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {albums.map((album) => {
          const albumSongs = songs.filter((s) => s.albumId === album.id).sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
          return (
            <EntityCard
              key={album.id}
              cover={album.coverBlob ?? albumSongs[0]?.coverBlob}
              title={album.title}
              subtitle={artistMap.get(album.artistId)}
              onClick={() => navigate(`/albums/${album.id}`)}
              onPlay={albumSongs.length ? () => playQueue(albumSongs, 0) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
