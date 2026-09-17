import { db } from './db'
import { newId } from '../lib/id'
import type { Playlist } from '../types'

export async function createPlaylist(name: string, description?: string): Promise<Playlist> {
  const now = Date.now()
  const playlist: Playlist = { id: newId(), name: name.trim() || 'Playlist sin nombre', description, dateCreated: now, dateModified: now }
  await db.playlists.add(playlist)
  return playlist
}

export async function updatePlaylist(id: string, patch: Partial<Omit<Playlist, 'id'>>): Promise<void> {
  await db.playlists.update(id, { ...patch, dateModified: Date.now() })
}

export async function deletePlaylist(id: string): Promise<void> {
  await db.transaction('rw', db.playlists, db.playlistSongs, async () => {
    await db.playlists.delete(id)
    await db.playlistSongs.where('playlistId').equals(id).delete()
  })
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
  const existing = await db.playlistSongs.where({ playlistId, songId }).first()
  if (existing) return
  const count = await db.playlistSongs.where('playlistId').equals(playlistId).count()
  await db.playlistSongs.add({ id: newId(), playlistId, songId, position: count, dateAdded: Date.now() })
  await db.playlists.update(playlistId, { dateModified: Date.now() })
}

export async function removeSongFromPlaylist(playlistSongId: string, playlistId: string): Promise<void> {
  await db.playlistSongs.delete(playlistSongId)
  const remaining = await db.playlistSongs.where('playlistId').equals(playlistId).sortBy('position')
  await db.transaction('rw', db.playlistSongs, async () => {
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].position !== i) await db.playlistSongs.update(remaining[i].id, { position: i })
    }
  })
  await db.playlists.update(playlistId, { dateModified: Date.now() })
}

export async function reorderPlaylistSongs(playlistId: string, orderedPlaylistSongIds: string[]): Promise<void> {
  await db.transaction('rw', db.playlistSongs, async () => {
    for (let i = 0; i < orderedPlaylistSongIds.length; i++) {
      await db.playlistSongs.update(orderedPlaylistSongIds[i], { position: i })
    }
  })
  await db.playlists.update(playlistId, { dateModified: Date.now() })
}

