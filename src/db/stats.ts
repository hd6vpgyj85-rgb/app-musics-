import { db } from './db'
import { newId } from '../lib/id'
import type { SongWithRelations } from '../types'

export async function isFavorite(songId: string): Promise<boolean> {
  const f = await db.favorites.where('songId').equals(songId).first()
  return !!f
}

export async function toggleFavorite(songId: string): Promise<boolean> {
  const existing = await db.favorites.where('songId').equals(songId).first()
  if (existing) {
    await db.favorites.delete(existing.id)
    return false
  }
  await db.favorites.add({ id: newId(), songId, dateAdded: Date.now() })
  return true
}

export async function listFavoriteSongIds(): Promise<Set<string>> {
  const favs = await db.favorites.toArray()
  return new Set(favs.map((f) => f.songId))
}

export async function recordPlay(songId: string, msPlayed: number, completed: boolean): Promise<void> {
  if (msPlayed < 1000 && !completed) return
  await db.playHistory.add({ id: newId(), songId, playedAt: Date.now(), msPlayed, completed })
}

export interface LibraryStats {
  totalPlays: number
  totalMsListened: number
  topSongs: { song: SongWithRelations; plays: number }[]
  topArtists: { name: string; plays: number }[]
  topAlbums: { title: string; plays: number }[]
  recentlyPlayed: SongWithRelations[]
  dailyMinutes: { day: string; minutes: number }[]
  firstPlayedAt?: number
  lastPlayedAt?: number
}

export async function computeStats(songs: SongWithRelations[]): Promise<LibraryStats> {
  const history = await db.playHistory.orderBy('playedAt').toArray()
  const songMap = new Map(songs.map((s) => [s.id, s]))

  const playsBySong = new Map<string, number>()
  const msBySong = new Map<string, number>()
  let totalMs = 0

  for (const h of history) {
    playsBySong.set(h.songId, (playsBySong.get(h.songId) ?? 0) + 1)
    msBySong.set(h.songId, (msBySong.get(h.songId) ?? 0) + h.msPlayed)
    totalMs += h.msPlayed
  }

  const topSongs = [...playsBySong.entries()]
    .map(([songId, plays]) => ({ song: songMap.get(songId), plays }))
    .filter((e): e is { song: SongWithRelations; plays: number } => !!e.song)
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 10)

  const artistPlays = new Map<string, number>()
  const albumPlays = new Map<string, number>()
  for (const [songId, plays] of playsBySong) {
    const song = songMap.get(songId)
    if (!song) continue
    if (song.artist) artistPlays.set(song.artist.name, (artistPlays.get(song.artist.name) ?? 0) + plays)
    if (song.album) albumPlays.set(song.album.title, (albumPlays.get(song.album.title) ?? 0) + plays)
  }

  const topArtists = [...artistPlays.entries()].map(([name, plays]) => ({ name, plays })).sort((a, b) => b.plays - a.plays).slice(0, 10)
  const topAlbums = [...albumPlays.entries()].map(([title, plays]) => ({ title, plays })).sort((a, b) => b.plays - a.plays).slice(0, 10)

  const recentSongIds: string[] = []
  for (let i = history.length - 1; i >= 0 && recentSongIds.length < 12; i--) {
    if (!recentSongIds.includes(history[i].songId)) recentSongIds.push(history[i].songId)
  }
  const recentlyPlayed = recentSongIds.map((id) => songMap.get(id)).filter((s): s is SongWithRelations => !!s)

  const dailyMap = new Map<string, number>()
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dailyMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const h of history) {
    const key = new Date(h.playedAt).toISOString().slice(0, 10)
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + h.msPlayed / 60000)
  }
  const dailyMinutes = [...dailyMap.entries()].map(([day, minutes]) => ({ day, minutes: Math.round(minutes) }))

  return {
    totalPlays: history.length,
    totalMsListened: totalMs,
    topSongs,
    topArtists,
    topAlbums,
    recentlyPlayed,
    dailyMinutes,
    firstPlayedAt: history[0]?.playedAt,
    lastPlayedAt: history[history.length - 1]?.playedAt,
  }
}
