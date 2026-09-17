import { db } from '../db/db'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function base64ToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

interface BackupFile {
  version: 1
  exportedAt: number
  artists: unknown[]
  albums: unknown[]
  songs: unknown[]
  playlists: unknown[]
  playlistSongs: unknown[]
  favorites: unknown[]
  playHistory: unknown[]
}

export async function exportBackup(onProgress?: (done: number, total: number) => void): Promise<Blob> {
  const [artists, albums, songs, playlists, playlistSongs, favorites, playHistory] = await Promise.all([
    db.artists.toArray(),
    db.albums.toArray(),
    db.songs.toArray(),
    db.playlists.toArray(),
    db.playlistSongs.toArray(),
    db.favorites.toArray(),
    db.playHistory.toArray(),
  ])

  const total = artists.length + albums.length + songs.length + playlists.length
  let done = 0
  const tick = () => onProgress?.(++done, total)

  const artistsOut = await Promise.all(
    artists.map(async (a) => {
      const out = { ...a, imageBlob: a.imageBlob ? await blobToBase64(a.imageBlob) : undefined }
      tick()
      return out
    }),
  )
  const albumsOut = await Promise.all(
    albums.map(async (a) => {
      const out = { ...a, coverBlob: a.coverBlob ? await blobToBase64(a.coverBlob) : undefined }
      tick()
      return out
    }),
  )
  const songsOut = await Promise.all(
    songs.map(async (s) => {
      const out = { ...s, fileBlob: await blobToBase64(s.fileBlob), coverBlob: s.coverBlob ? await blobToBase64(s.coverBlob) : undefined }
      tick()
      return out
    }),
  )
  const playlistsOut = await Promise.all(
    playlists.map(async (p) => {
      const out = { ...p, coverBlob: p.coverBlob ? await blobToBase64(p.coverBlob) : undefined }
      tick()
      return out
    }),
  )

  const backup: BackupFile = {
    version: 1,
    exportedAt: Date.now(),
    artists: artistsOut,
    albums: albumsOut,
    songs: songsOut,
    playlists: playlistsOut,
    playlistSongs,
    favorites,
    playHistory,
  }

  return new Blob([JSON.stringify(backup)], { type: 'application/json' })
}

export function downloadBackup(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `sonora-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File): Promise<{ songs: number; playlists: number }> {
  const text = await file.text()
  const data = JSON.parse(text) as BackupFile
  if (data.version !== 1) throw new Error('Formato de respaldo no compatible.')

  await db.transaction(
    'rw',
    [db.artists, db.albums, db.songs, db.playlists, db.playlistSongs, db.favorites, db.playHistory],
    async () => {
    for (const a of data.artists as any[]) {
      await db.artists.put({ ...a, imageBlob: typeof a.imageBlob === 'string' ? await base64ToBlob(a.imageBlob) : undefined })
    }
    for (const a of data.albums as any[]) {
      await db.albums.put({ ...a, coverBlob: typeof a.coverBlob === 'string' ? await base64ToBlob(a.coverBlob) : undefined })
    }
    for (const s of data.songs as any[]) {
      await db.songs.put({
        ...s,
        fileBlob: await base64ToBlob(s.fileBlob),
        coverBlob: typeof s.coverBlob === 'string' ? await base64ToBlob(s.coverBlob) : undefined,
      })
    }
    for (const p of data.playlists as any[]) {
      await db.playlists.put({ ...p, coverBlob: typeof p.coverBlob === 'string' ? await base64ToBlob(p.coverBlob) : undefined })
    }
      for (const ps of data.playlistSongs as any[]) await db.playlistSongs.put(ps)
      for (const f of data.favorites as any[]) await db.favorites.put(f)
      for (const h of data.playHistory as any[]) await db.playHistory.put(h)
    },
  )

  return { songs: data.songs.length, playlists: data.playlists.length }
}
