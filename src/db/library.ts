import { db } from './db'
import { newId } from '../lib/id'
import type { Album, Artist, Song, SongWithRelations } from '../types'

export async function getOrCreateArtist(name: string): Promise<Artist> {
  const trimmed = name.trim() || 'Artista desconocido'
  const existing = await db.artists.where('name').equalsIgnoreCase(trimmed).first()
  if (existing) return existing
  const artist: Artist = { id: newId(), name: trimmed, createdAt: Date.now() }
  await db.artists.add(artist)
  return artist
}

export async function getOrCreateAlbum(title: string, artistId: string, year?: number): Promise<Album> {
  const trimmed = title.trim()
  if (!trimmed) return { id: '', title: '', artistId, createdAt: 0 } as Album
  const existing = await db.albums.where({ artistId }).filter((a) => a.title.toLowerCase() === trimmed.toLowerCase()).first()
  if (existing) return existing
  const album: Album = { id: newId(), title: trimmed, artistId, year, createdAt: Date.now() }
  await db.albums.add(album)
  return album
}

export async function addSong(input: Omit<Song, 'id' | 'dateAdded'>): Promise<Song> {
  const song: Song = { ...input, id: newId(), dateAdded: Date.now() }
  await db.songs.add(song)
  return song
}

export async function updateSong(id: string, patch: Partial<Omit<Song, 'id'>>): Promise<void> {
  await db.songs.update(id, patch)
}

export async function deleteSong(id: string): Promise<void> {
  await db.transaction('rw', db.songs, db.playlistSongs, db.favorites, db.playHistory, async () => {
    await db.songs.delete(id)
    await db.playlistSongs.where('songId').equals(id).delete()
    await db.favorites.where('songId').equals(id).delete()
    await db.playHistory.where('songId').equals(id).delete()
  })
}

export async function deleteAlbum(id: string, deleteSongs: boolean): Promise<void> {
  if (deleteSongs) {
    const songs = await db.songs.where('albumId').equals(id).toArray()
    for (const s of songs) await deleteSong(s.id)
  } else {
    await db.songs.where('albumId').equals(id).modify({ albumId: undefined })
  }
  await db.albums.delete(id)
}

export async function deleteArtist(id: string, deleteSongs: boolean): Promise<void> {
  const albums = await db.albums.where('artistId').equals(id).toArray()
  if (deleteSongs) {
    const songs = await db.songs.where('artistId').equals(id).toArray()
    for (const s of songs) await deleteSong(s.id)
    for (const a of albums) await db.albums.delete(a.id)
  } else {
    const fallback = await getOrCreateArtist('Artista desconocido')
    await db.songs.where('artistId').equals(id).modify({ artistId: fallback.id })
    await db.albums.where('artistId').equals(id).modify({ artistId: fallback.id })
  }
  await db.artists.delete(id)
}

export async function updateArtist(id: string, patch: Partial<Omit<Artist, 'id'>>): Promise<void> {
  await db.artists.update(id, patch)
}

export async function updateAlbum(id: string, patch: Partial<Omit<Album, 'id'>>): Promise<void> {
  await db.albums.update(id, patch)
}

export async function listSongsWithRelations(): Promise<SongWithRelations[]> {
  const [songs, artists, albums] = await Promise.all([
    db.songs.orderBy('dateAdded').reverse().toArray(),
    db.artists.toArray(),
    db.albums.toArray(),
  ])
  const artistMap = new Map(artists.map((a) => [a.id, a]))
  const albumMap = new Map(albums.map((a) => [a.id, a]))
  return songs.map((s) => ({ ...s, artist: artistMap.get(s.artistId), album: s.albumId ? albumMap.get(s.albumId) : undefined }))
}

export function searchLibrary(query: string, songs: SongWithRelations[], artists: Artist[], albums: Album[], playlists: { id: string; name: string }[]) {
  const q = query.trim().toLowerCase()
  if (!q) return { songs: [], artists: [], albums: [], playlists: [] }
  return {
    songs: songs.filter((s) => s.title.toLowerCase().includes(q) || s.artist?.name.toLowerCase().includes(q)).slice(0, 20),
    artists: artists.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 10),
    albums: albums.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 10),
    playlists: playlists.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 10),
  }
}
